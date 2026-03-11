import { fbos as seedFBOs, airports as seedAirports, states } from '../data/seed';
import fuelPricesData from '../data/fuel-prices.json';
import usAirportsDb from '../data/us-airports.json';

// Build comprehensive FBO + airport lists by merging seed data with scraped AirNav data.
// Scraped data is the primary source for prices; seed data fills in airports not yet scraped.

// Region code to state name mapping (e.g., 'US-TX' → 'Texas')
const regionToState = {};
for (const s of states) {
    regionToState[`US-${s.abbr}`] = s.name;
}

// Build comprehensive ICAO → {city, state} lookup from all sources
const airportLookup = new Map();
// Layer 1: OurAirports database (broadest coverage)
for (const a of usAirportsDb) {
    airportLookup.set(a.icao, { city: a.city || '', state: regionToState[a.region] || '' });
}
// Layer 2: seed airports (may have better city names)
for (const a of seedAirports) {
    airportLookup.set(a.icao, { city: a.city || '', state: a.state || '' });
}

// Junk names to filter out from scraped data
const JUNK_NAMES = ['no comments', 'web site', 'email', 'read', 'write',
    'Destin Jeep Rentals', 'Prestige Limousine', 'Small Town Car Rental',
    'M & W Auto Rentals', 'Abe\'s Cajun Market', 'RealClean Aircraft Detailing',
    'RealClean Aircraft Detailing Lowcountry'];

function isJunkName(name) {
    if (!name || name.length < 3) return true;
    return JUNK_NAMES.some(j => name.toLowerCase() === j.toLowerCase());
}

function buildSlug(name, icao) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, '') + '-' + icao.toLowerCase();
}

// ---- Phase 1: Build FBOs from scraped AirNav data ----
const scrapedFBOs = [];
const scrapedAirportCodes = new Set();

for (const [icao, airportData] of Object.entries(fuelPricesData)) {
    if (icao === '_meta' || !airportData.fbos) continue;
    scrapedAirportCodes.add(icao);

    for (const fbo of airportData.fbos) {
        if (isJunkName(fbo.name)) continue;
        const slug = buildSlug(fbo.name, icao);

        // Check if we have a matching seed FBO for richer data
        const seedMatch = seedFBOs.find(s =>
            s.airportCode === icao && s.name.toLowerCase() === fbo.name.toLowerCase()
        );

        // Resolve city/state: scraped data → seed match → comprehensive airport lookup
        const airportInfo = airportLookup.get(icao);
        const city = airportData.city || seedMatch?.city || airportInfo?.city || '';
        const state = airportData.state || seedMatch?.state || airportInfo?.state || '';

        scrapedFBOs.push({
            slug,
            name: fbo.name,
            airportCode: icao,
            state,
            city,
            services: seedMatch?.services || ['Fuel Service', 'Aircraft Parking'],
            fuelTypes: [
                ...(fbo.jetA ? ['Jet-A'] : []),
                ...(fbo.hundredLL ? ['100LL'] : []),
            ],
            phone: seedMatch?.phone || null,
            website: seedMatch?.website || null,
            email: seedMatch?.email || null,
            hours: seedMatch?.hours || null,
            description: seedMatch?.description || `${fbo.name} is a fixed-base operator at ${icao}${city ? ` in ${city}` : ''}${state ? `, ${state}` : ''}.`,
            fuelPrices: {
                jetA: fbo.jetA,
                jetASelfServe: fbo.jetASelfServe || null,
                hundredLL: fbo.hundredLL,
                hundredLLSelfServe: fbo.hundredLLSelfServe || null,
            },
            rampFee: seedMatch?.rampFee || 0,
            rampFeeWaived: seedMatch?.rampFeeWaived || null,
            priceUpdated: fbo.priceDate || airportData.updated || null,
            serviceType: fbo.serviceType || null,
            source: 'airnav',
        });
    }
}

// ---- Phase 2: Add ALL seed FBOs that don't already exist in scraped data ----
// Only skip a seed FBO if scraped data has an exact name match at the same airport
for (const seedFBO of seedFBOs) {
    const exactMatch = scrapedFBOs.some(
        f => f.airportCode === seedFBO.airportCode &&
            f.name.toLowerCase() === seedFBO.name.toLowerCase()
    );
    if (!exactMatch) {
        scrapedFBOs.push({ ...seedFBO, source: 'seed' });
    }
}

// Deduplicate by slug
const slugMap = new Map();
for (const fbo of scrapedFBOs) {
    if (!slugMap.has(fbo.slug)) {
        slugMap.set(fbo.slug, fbo);
    }
}
const fbos = [...slugMap.values()];

// Build comprehensive airport list from seed + scraped
const airportMap = new Map();
for (const a of seedAirports) airportMap.set(a.icao, a);
for (const [icao, data] of Object.entries(fuelPricesData)) {
    if (icao === '_meta') continue;
    if (!airportMap.has(icao) && data.name) {
        airportMap.set(icao, {
            icao,
            name: data.name,
            city: data.city || '',
            state: data.state || '',
            lat: 0,
            lng: 0,
        });
    }
}
const airports = [...airportMap.values()];

export function getLastUpdated() {
    return fuelPricesData._meta?.lastUpdated || '2026-03-03';
}

export function getScrapedStats() {
    return fuelPricesData._meta || {};
}

export function getAllStates() {
    return states.map(s => ({
        ...s,
        fboCount: fbos.filter(f => f.state === s.name).length,
        airportCount: [...new Set(fbos.filter(f => f.state === s.name).map(f => f.airportCode))].length,
    })).sort((a, b) => b.fboCount - a.fboCount);
}

export function getStateBySlug(slug) {
    return states.find(s => s.slug === slug) || null;
}

export function getAllAirports() {
    return airports;
}

export function getAirportByCode(icao) {
    return airports.find(a => a.icao === icao) || null;
}

export function getAllFBOs() {
    return fbos;
}

export function getFBOBySlug(slug) {
    return fbos.find(f => f.slug === slug) || null;
}

export function getFBOsByState(stateName) {
    return fbos.filter(f => f.state === stateName);
}

export function getFBOsByAirport(icao) {
    return fbos.filter(f => f.airportCode === icao);
}

export function getAirportsByState(stateName) {
    const codes = [...new Set(fbos.filter(f => f.state === stateName).map(f => f.airportCode))];
    return codes.map(c => airports.find(a => a.icao === c)).filter(Boolean);
}

export function getStats() {
    return {
        totalFBOs: fbos.length,
        totalAirports: [...new Set(fbos.map(f => f.airportCode))].length,
        totalStates: [...new Set(fbos.map(f => f.state))].filter(Boolean).length,
    };
}

export function getUniqueServices() {
    const all = fbos.flatMap(f => f.services || []);
    return [...new Set(all)].sort();
}

export function getUniqueFuelTypes() {
    const all = fbos.flatMap(f => f.fuelTypes || []);
    return [...new Set(all)].sort();
}

function rankFBOs(fboList) {
    const withPrices = fboList.filter(f => f.fuelPrices?.jetA);
    const noPrices = fboList.filter(f => !f.fuelPrices?.jetA);
    const sorted = withPrices.sort((a, b) => a.fuelPrices.jetA - b.fuelPrices.jetA);
    const cheapest = sorted[0]?.fuelPrices?.jetA || 0;
    return [
        ...sorted.map((f, i) => ({
            ...f,
            rank: i + 1,
            delta: +(f.fuelPrices.jetA - cheapest).toFixed(2),
        })),
        ...noPrices.map(f => ({ ...f, rank: null, delta: null })),
    ];
}

export function getRankedFBOs() {
    return rankFBOs([...fbos]);
}

export function getRankedFBOsByState(stateName) {
    return rankFBOs(fbos.filter(f => f.state === stateName));
}

export function getRankedFBOsByAirport(icao) {
    return rankFBOs(fbos.filter(f => f.airportCode === icao));
}

export function getPriceStats(fboList) {
    const prices = fboList.filter(f => f.fuelPrices?.jetA).map(f => f.fuelPrices.jetA);
    if (prices.length === 0) return { cheapest: null, average: null, mostExpensive: null, count: 0 };
    return {
        cheapest: Math.min(...prices),
        average: +(prices.reduce((s, p) => s + p, 0) / prices.length).toFixed(2),
        mostExpensive: Math.max(...prices),
        count: prices.length,
    };
}

export function getStatesWithPrices() {
    return states.map(s => {
        const stateFBOs = fbos.filter(f => f.state === s.name && f.fuelPrices?.jetA);
        const cheapest = stateFBOs.length > 0 ? Math.min(...stateFBOs.map(f => f.fuelPrices.jetA)) : null;
        return {
            ...s,
            fboCount: fbos.filter(f => f.state === s.name).length,
            airportCount: [...new Set(fbos.filter(f => f.state === s.name).map(f => f.airportCode))].length,
            cheapestJetA: cheapest,
        };
    }).sort((a, b) => (a.cheapestJetA || 99) - (b.cheapestJetA || 99));
}
