/**
 * Test the AirNav local fuel search to discover airports with FBOs.
 */
import puppeteer from 'puppeteer';

async function main() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');

    // Try direct airport page to get FBO data
    console.log('=== Testing KDAL (Dallas Love Field) ===');
    await page.goto('https://www.airnav.com/airport/KDAL', { waitUntil: 'networkidle2', timeout: 30000 });

    let data = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const fboIdx = bodyText.indexOf('FBO, Fuel');
        if (fboIdx === -1) return { noFBOs: true, snippet: bodyText.substring(0, 500) };
        return { fboSection: bodyText.substring(fboIdx, fboIdx + 3000) };
    });
    console.log(JSON.stringify(data, null, 2));

    // Test KADS (Addison, should have FBOs)
    console.log('\n=== Testing KADS (Addison Airport) ===');
    await page.goto('https://www.airnav.com/airport/KADS', { waitUntil: 'networkidle2', timeout: 30000 });

    data = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const fboIdx = bodyText.indexOf('FBO, Fuel');
        if (fboIdx === -1) return { noFBOs: true, snippet: bodyText.substring(0, 500) };
        return { fboSection: bodyText.substring(fboIdx, fboIdx + 3000) };
    });
    console.log(JSON.stringify(data, null, 2));

    // Now test: can we get a list of ALL airports in Texas from AirNav?
    console.log('\n=== Testing airport list discovery ===');
    // Use POST to submit the airport search form
    await page.goto('https://www.airnav.com/airports/', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.type('input[name="s"]', 'Texas');
    await page.click('#submit');
    try { await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }); } catch { }
    await new Promise(r => setTimeout(r, 2000));

    data = await page.evaluate(() => {
        const links = document.querySelectorAll('a[href*="/airport/"]');
        const airports = [];
        for (const l of links) {
            const match = (l.getAttribute('href') || '').match(/\/airport\/([A-Z0-9]{3,4})$/);
            if (match) airports.push({ code: match[1], text: l.textContent.trim().substring(0, 60) });
        }
        return { count: airports.length, first20: airports.slice(0, 20) };
    });
    console.log(`Found ${data.count} airport links`);
    console.log(JSON.stringify(data.first20, null, 2));

    await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
