#!/usr/bin/env node
/**
 * Comprehensive AirNav FBO + Fuel Price Scraper
 * 
 * Uses OurAirports database for airport discovery (913 US airports),
 * then scrapes each airport page on AirNav.com for FBO names and fuel prices.
 * 
 * Features:
 * - Rate-limit detection: backs off when AirNav returns empty pages for known FBO airports
 * - Resume support: merges new scrapes with existing data (won't overwrite known FBOs)
 * - Batch mode: use --limit to scrape in manageable chunks
 * - State filter: use --state TX to scrape only one state
 * 
 * Usage:
 *   node scripts/scrape-prices.mjs                # Full scrape
 *   node scripts/scrape-prices.mjs --limit 100    # First 100 airports
 *   node scripts/scrape-prices.mjs --state TX     # Only Texas
 *   node scripts/scrape-prices.mjs --resume       # Resume from last position
 */
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRICES_PATH = join(__dirname, '..', 'src', 'data', 'fuel-prices.json');
const AIRPORTS_JSON = join(__dirname, 'us-airports.json');
const PROGRESS_PATH = join(__dirname, '.scrape-progress.json');

const args = process.argv.slice(2);
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;
const stateIdx = args.indexOf('--state');
const stateFilter = stateIdx >= 0 ? args[stateIdx + 1] : null;
const resumeMode = args.includes('--resume');

const DELAY_MIN = 3000;  // 3 seconds minimum between requests
const DELAY_MAX = 5000;  // 5 seconds max
const BACKOFF_DELAY = 30000; // 30s backoff when rate-limited
const MAX_CONSECUTIVE_EMPTY = 15; // After this many consecutive "no FBOs", assume rate-limited

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function loadAirports() {
    let airports;
    if (existsSync(AIRPORTS_JSON)) {
        airports = JSON.parse(readFileSync(AIRPORTS_JSON, 'utf-8'));
    } else {
        console.log('  Downloading airport list from OurAirports...');
        const resp = await fetch('https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv');
        const text = await resp.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        airports = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const fields = []; let field = ''; let inQ = false;
            for (const ch of lines[i]) {
                if (ch === '"') { inQ = !inQ; continue; }
                if (ch === ',' && !inQ) { fields.push(field.trim()); field = ''; continue; }
                field += ch;
            }
            fields.push(field.trim());
            const row = {}; headers.forEach((h, idx) => { row[h] = fields[idx] || ''; });
            if (row.iso_country !== 'US') continue;
            if (row.type !== 'medium_airport' && row.type !== 'large_airport') continue;
            const ident = row.ident || row.gps_code;
            if (!ident || (!ident.startsWith('K') && !ident.startsWith('P'))) continue;
            airports.push({ icao: ident, name: row.name, city: row.municipality, region: row.iso_region });
        }
        writeFileSync(AIRPORTS_JSON, JSON.stringify(airports, null, 2));
    }
    if (stateFilter) airports = airports.filter(a => a.region === `US-${stateFilter}`);
    return airports;
}

async function scrapeAirport(page, icao) {
    try {
        await page.goto(`https://www.airnav.com/airport/${icao}`, {
            waitUntil: 'networkidle2', timeout: 30000
        });

        return await page.evaluate((airportCode) => {
            const title = document.title || '';
            const nameMatch = title.match(/AirNav:\s*\w+\s*-\s*(.+)/);
            const airportName = nameMatch ? nameMatch[1].trim() : '';
            const bodyText = document.body.innerText;

            // Detect rate limiting - check if page loaded properly
            if (bodyText.length < 200 || bodyText.includes('Too many requests') ||
                bodyText.includes('Access denied') || bodyText.includes('Please try again')) {
                return { rateLimited: true, airportName, fbos: [] };
            }

            const cityMatch = bodyText.match(/City:\s*(.+)/);
            const stMatch = bodyText.match(/State:\s*(.+)/);
            let city = cityMatch ? cityMatch[1].trim().split('\n')[0].trim() : '';
            let state = stMatch ? stMatch[1].trim().split('\n')[0].trim() : '';

            // Fallback: try extracting from table rows with City/State labels
            if (!city || !state) {
                const rows = document.querySelectorAll('tr');
                for (const row of rows) {
                    const cells = row.querySelectorAll('td');
                    for (let c = 0; c < cells.length - 1; c++) {
                        const label = cells[c].textContent.trim();
                        const value = cells[c + 1].textContent.trim();
                        if (!city && label.includes('City:')) {
                            city = value.split('\n')[0].trim();
                        }
                        if (!state && (label.includes('State:') || label.includes('State/Province:'))) {
                            state = value.split('\n')[0].trim();
                        }
                    }
                }
            }

            // Last fallback: try to extract from page title (e.g., "AirNav: KXXX - City Name Airport")
            if (!city) {
                const titleCityMatch = title.match(/AirNav:\s*\w+\s*-\s*(.+?)(?:\s+(?:Regional|International|Municipal|Memorial|County|Executive|Metro|National)\s+(?:Airport|Airpark|Jetport|Field))/i);
                if (titleCityMatch) {
                    city = titleCityMatch[1].trim();
                }
            }

            const fboIdx = bodyText.indexOf('FBO, Fuel');
            if (fboIdx === -1) return { airportName, city, state, fbos: [] };

            let fboText = bodyText.substring(fboIdx, fboIdx + 15000);
            const altIdx = fboText.indexOf('Alternatives at nearby airports');
            if (altIdx > 0) fboText = fboText.substring(0, altIdx);
            const otherIdx = fboText.indexOf('Other Pages about');
            if (otherIdx > 0) fboText = fboText.substring(0, otherIdx);
            const wouldIdx = fboText.indexOf('Would you like to see');
            if (wouldIdx > 0) fboText = fboText.substring(0, wouldIdx);

            const fboLinks = document.querySelectorAll('a[href*="/airport/"][href*="/"]');
            const fbos = [];
            const seenNames = new Set();
            for (const link of fboLinks) {
                const href = link.getAttribute('href') || '';
                const text = link.textContent.trim();
                if (text.startsWith('More info')) continue;
                const parts = href.split('/').filter(Boolean);
                if (parts.length >= 3 && parts[0] === 'airport' && parts[1].toUpperCase() === airportCode) {
                    const fboCode = parts[2];
                    if (fboCode.startsWith('#') || fboCode === 'link' || fboCode === 'comment' ||
                        fboCode.includes('.') || fboCode === 'submitphoto') continue;
                    if (!text || text.length < 2 || seenNames.has(text)) continue;
                    if (text.includes('read') || text.includes('write') ||
                        text.includes('photo') || text === 'web site' || text === 'email') continue;
                    seenNames.add(text);
                    fbos.push({ name: text, fboCode });
                }
            }

            const priceRegex = /(FS|SS)\s+(?:\$?([\d.]+)\s+)?(?:\$?([\d.]+))\s*(?:\$?([\d.]+))?/g;
            const dateRegex = /Updated\s+([\d]+-[A-Za-z]+-[\d]+)/g;
            const allPrices = [...fboText.matchAll(priceRegex)];
            const allDates = [...fboText.matchAll(dateRegex)];

            let priceIdx = 0, dateIdx = 0;
            for (let i = 0; i < fbos.length; i++) {
                const fbo = fbos[i];
                const namePos = fboText.indexOf(fbo.name);
                if (namePos === -1) continue;
                while (priceIdx < allPrices.length && allPrices[priceIdx].index < namePos) priceIdx++;
                const nextPos = i + 1 < fbos.length ? fboText.indexOf(fbos[i + 1].name) : fboText.length;
                while (priceIdx < allPrices.length && allPrices[priceIdx].index < nextPos) {
                    const m = allPrices[priceIdx];
                    const p1 = m[2] ? parseFloat(m[2]) : null;
                    const p2 = m[3] ? parseFloat(m[3]) : null;
                    if (m[1] === 'FS') { fbo.hundredLL = p1; fbo.jetA = p2; fbo.serviceType = 'FS'; }
                    else if (m[1] === 'SS') { fbo.hundredLLSS = p1; fbo.jetASS = p2; }
                    priceIdx++;
                }
                while (dateIdx < allDates.length && allDates[dateIdx].index < namePos) dateIdx++;
                if (dateIdx < allDates.length && allDates[dateIdx].index < nextPos) {
                    fbo.priceDate = allDates[dateIdx][1]; dateIdx++;
                }
            }

            return { airportName, city, state, fbos: fbos.filter(f => f.name && f.name.length > 1) };
        }, icao);
    } catch (err) {
        return { error: err.message, fbos: [] };
    }
}

async function main() {
    console.log('🛩️  AirNav FBO & Fuel Price Scraper');
    console.log('====================================\n');

    // Load existing data to merge with
    let existing = {};
    if (existsSync(PRICES_PATH)) {
        try { existing = JSON.parse(readFileSync(PRICES_PATH, 'utf-8')); } catch { }
    }

    // Load airport list
    let airportList = await loadAirports();
    console.log(`📡 ${airportList.length} airports in database`);

    // Resume from last position if requested
    let startIdx = 0;
    if (resumeMode && existsSync(PROGRESS_PATH)) {
        const progress = JSON.parse(readFileSync(PROGRESS_PATH, 'utf-8'));
        startIdx = progress.lastIndex || 0;
        console.log(`🔄 Resuming from airport ${startIdx}`);
    }

    const toScrape = airportList.slice(startIdx, startIdx + limit);
    console.log(`🔍 Scraping airports ${startIdx + 1} to ${startIdx + toScrape.length}...\n`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Start with existing data
    const results = { ...existing };
    delete results._meta;
    let totalFBOs = 0, withPrices = 0, errors = 0, consecutiveEmpty = 0;

    for (let i = 0; i < toScrape.length; i++) {
        const icao = toScrape[i].icao;
        process.stdout.write(`  [${startIdx + i + 1}/${airportList.length}] ${icao}...`);

        const data = await scrapeAirport(page, icao);

        if (data.rateLimited) {
            console.log(` ⚠️  Rate limited! Backing off 30s...`);
            await delay(BACKOFF_DELAY);
            // Retry once
            const retry = await scrapeAirport(page, icao);
            if (retry.rateLimited || retry.error) {
                console.log(`  Still rate limited. Saving progress and stopping.`);
                break;
            }
            Object.assign(data, retry);
            consecutiveEmpty = 0;
        }

        if (data.error) {
            console.log(` ✗ ${data.error}`);
            errors++;
            consecutiveEmpty++;
        } else if (data.fbos.length > 0) {
            results[icao] = {
                name: data.airportName,
                city: data.city,
                state: data.state,
                fbos: data.fbos.map(f => ({
                    name: f.name,
                    jetA: f.jetA || null,
                    hundredLL: f.hundredLL || null,
                    jetASelfServe: f.jetASS || null,
                    hundredLLSelfServe: f.hundredLLSS || null,
                    serviceType: f.serviceType || null,
                    priceDate: f.priceDate || null,
                })),
                updated: new Date().toISOString().split('T')[0],
            };
            totalFBOs += data.fbos.length;
            withPrices += data.fbos.filter(f => f.jetA).length;
            console.log(` ✓ ${data.fbos.length} FBOs`);
            consecutiveEmpty = 0;
        } else {
            console.log(` – no FBOs`);
            consecutiveEmpty++;
        }

        // Rate limit detection: if too many consecutive empty, slow down
        if (consecutiveEmpty >= MAX_CONSECUTIVE_EMPTY) {
            console.log(`\n  ⚠️  ${MAX_CONSECUTIVE_EMPTY} consecutive empty results. Possible rate limiting.`);
            console.log(`  Backing off for 30 seconds...\n`);
            await delay(BACKOFF_DELAY);
            consecutiveEmpty = 0;
        }

        // Save progress periodically
        if ((i + 1) % 50 === 0) {
            writeFileSync(PROGRESS_PATH, JSON.stringify({ lastIndex: startIdx + i + 1 }));
        }

        await delay(DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN));
    }

    await browser.close();

    // Save final progress
    writeFileSync(PROGRESS_PATH, JSON.stringify({ lastIndex: startIdx + toScrape.length }));

    // Count all FBOs in merged results
    let allFBOs = 0, allWithPrices = 0;
    for (const [k, v] of Object.entries(results)) {
        if (k === '_meta') continue;
        allFBOs += v.fbos?.length || 0;
        allWithPrices += (v.fbos || []).filter(f => f.jetA).length;
    }

    results._meta = {
        lastUpdated: new Date().toISOString().split('T')[0],
        lastUpdatedISO: new Date().toISOString(),
        source: 'airnav.com',
        totalAirports: Object.keys(results).filter(k => k !== '_meta').length,
        totalFBOs: allFBOs,
        fbosWithPrices: allWithPrices,
        errors,
        thisRunNew: totalFBOs,
    };

    writeFileSync(PRICES_PATH, JSON.stringify(results, null, 2));

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ Scrape complete!`);
    console.log(`   This run: ${totalFBOs} FBOs from ${toScrape.length} airports`);
    console.log(`   Total: ${allFBOs} FBOs at ${results._meta.totalAirports} airports (${allWithPrices} with prices)`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Written to: ${PRICES_PATH}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
