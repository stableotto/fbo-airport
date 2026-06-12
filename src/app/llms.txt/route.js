import {
    getStats,
    getLastUpdated,
    getAllStates,
    getAllFBOs,
    getAirportByCode,
    getPriceHistoryMeta,
} from '@/lib/data';

export const dynamic = 'force-static';

const BASE = 'https://fboairport.com';

// Curated, data-driven llms.txt (see llmstxt.org) — a concise map of the site for AI
// agents and answer engines. Generated at build time so coverage stats and top-lists
// stay current without manual upkeep.
export function GET() {
    const stats = getStats();
    const history = getPriceHistoryMeta();
    const lastUpdated = new Date(getLastUpdated() + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    });

    const topStates = getAllStates().filter(s => s.fboCount > 0).slice(0, 15);

    const counts = new Map();
    for (const f of getAllFBOs()) counts.set(f.airportCode, (counts.get(f.airportCode) || 0) + 1);
    const topAirports = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 25)
        .map(([icao, count]) => ({ icao, count, ...(getAirportByCode(icao) || {}) }));

    const L = [];
    L.push('# FBO Airport');
    L.push('');
    L.push('> Compare aviation fuel prices (Jet-A and 100LL) at fixed-base operators (FBOs) across the United States: posted prices, cheapest-first rankings, and daily price-history trends, sourced from AirNav.');
    L.push('');
    L.push(`FBO Airport tracks fuel prices at ${stats.totalFBOs.toLocaleString()} FBOs across ${stats.totalAirports.toLocaleString()} airports in ${stats.totalStates} U.S. states. Pricing is refreshed daily (last update ${lastUpdated})${history?.dates > 1 ? `, and the site retains ${history.dates} days of recorded price history per airport` : ''}. Prices come from AirNav FBO reports; none are fabricated or estimated. Always confirm with the FBO before flying.`);
    L.push('');
    L.push('## Primary resources');
    L.push(`- [Cheapest Jet-A by state](${BASE}/cheapest-jet-a/): turbine Jet-A prices ranked cheapest first, per state`);
    L.push(`- [Cheapest 100LL by state](${BASE}/cheapest-100ll/): 100LL avgas prices for piston aircraft, per state`);
    L.push(`- [Self-serve fuel by state](${BASE}/self-serve-fuel/): self-service fuel and typical savings vs full-service`);
    L.push(`- [Fuel prices by airport](${BASE}/fuel-prices/): per-airport fuel pages including price-history trends`);
    L.push(`- [Browse all states](${BASE}/states/): index of every U.S. state`);
    L.push('');
    L.push('## Top states by FBO coverage');
    for (const s of topStates) {
        L.push(`- [${s.name}](${BASE}/state/${s.slug}/): ${s.fboCount} FBOs across ${s.airportCount} airports`);
    }
    L.push('');
    L.push('## Top airports by FBO coverage');
    for (const a of topAirports) {
        const loc = [a.city, a.state].filter(Boolean).join(', ');
        L.push(`- [${a.icao} — ${a.name || 'Airport'}](${BASE}/airport/${a.icao}/): ${a.count} FBOs${loc ? ` in ${loc}` : ''}`);
    }
    L.push('');
    L.push('## About');
    L.push(`- [About & methodology](${BASE}/about/): data sources, update cadence, and how prices are ranked`);
    L.push(`- [Contact & corrections](${BASE}/contact/): report a price or claim an FBO listing`);
    L.push('');

    return new Response(L.join('\n'), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
