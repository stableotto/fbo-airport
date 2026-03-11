/**
 * Download and extract US public airports with K/P ICAO codes from OurAirports.
 * Run: node scripts/build-airport-list.mjs
 * Outputs: scripts/us-airports.json
 */

const url = 'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv';

async function main() {
    console.log('Downloading OurAirports data...');
    const resp = await fetch(url);
    const text = await resp.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

    const airports = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        // Simple CSV parse (handles quoted fields)
        const fields = [];
        let field = '';
        let inQuote = false;
        for (const ch of lines[i]) {
            if (ch === '"') { inQuote = !inQuote; continue; }
            if (ch === ',' && !inQuote) { fields.push(field.trim()); field = ''; continue; }
            field += ch;
        }
        fields.push(field.trim());

        const row = {};
        headers.forEach((h, idx) => { row[h] = fields[idx] || ''; });

        // Filter: US, medium or large airports, K* or P* ident codes
        if (row.iso_country !== 'US') continue;
        if (row.type !== 'medium_airport' && row.type !== 'large_airport') continue;
        const ident = row.ident || row.gps_code || row.local_code;
        if (!ident) continue;
        if (!ident.startsWith('K') && !ident.startsWith('P')) continue;

        airports.push({
            icao: ident,
            name: row.name,
            city: row.municipality,
            region: row.iso_region,
            lat: parseFloat(row.latitude_deg),
            lng: parseFloat(row.longitude_deg),
            type: row.type,
        });
    }

    // Sort by ICAO
    airports.sort((a, b) => a.icao.localeCompare(b.icao));

    // State code mapping
    const regionToState = {};
    airports.forEach(a => {
        const st = a.region.replace('US-', '');
        if (!regionToState[st]) regionToState[st] = [];
        regionToState[st].push(a.icao);
    });

    console.log(`\nFound ${airports.length} US airports (medium+large, K*/P* codes)`);
    console.log('By state:');
    for (const [st, codes] of Object.entries(regionToState).sort((a, b) => b[1].length - a[1].length).slice(0, 10)) {
        console.log(`  ${st}: ${codes.length} airports`);
    }

    // Write JSON
    const { writeFileSync } = await import('fs');
    const { dirname, join } = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = dirname(fileURLToPath(import.meta.url));

    const outPath = join(__dirname, 'us-airports.json');
    writeFileSync(outPath, JSON.stringify(airports, null, 2));
    console.log(`\nWritten to: ${outPath}`);

    // Also output just ICAO codes as a simple list
    const icaoList = airports.map(a => a.icao);
    writeFileSync(join(__dirname, 'us-icao-codes.json'), JSON.stringify(icaoList));
    console.log(`ICAO codes: ${join(__dirname, 'us-icao-codes.json')}`);
}

main().catch(err => { console.error(err); process.exit(1); });
