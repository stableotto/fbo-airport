// Build a per-airport fuel-price history from the git history of fuel-prices.json.
//
// The daily auto-update commits a fresh snapshot of src/data/fuel-prices.json. Each of
// those commits is a dated price observation, so the git log of that one file is, in
// effect, a time series we already own — something AirNav itself does not surface. This
// script walks that history and distills it into src/data/price-history.json: for every
// airport, the cheapest (and average) Jet-A and cheapest 100LL price on each date.
//
// It is wired into the npm "prebuild" step so the deployed site always reflects fresh
// history. It MUST NOT break the build: any failure is swallowed, the previous file is
// kept if present, and the process always exits 0.

import { execFileSync } from 'node:child_process';
import { writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = 'src/data/fuel-prices.json';
const OUT = path.join(ROOT, 'src/data/price-history.json');

const git = (args) =>
    execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

function nums(fbos, key) {
    return fbos.map((f) => f && f[key]).filter((v) => typeof v === 'number' && v > 0);
}

try {
    // Oldest → newest commits that touched the price file, with the committer date.
    const log = git(['log', '--format=%H %cs', '--reverse', '--', FILE]).trim();
    if (!log) throw new Error('no commit history for ' + FILE);

    // Keep one snapshot per calendar date (the last commit of that day wins).
    const byDate = new Map();
    for (const line of log.split('\n')) {
        const sep = line.indexOf(' ');
        if (sep === -1) continue;
        byDate.set(line.slice(sep + 1).trim(), line.slice(0, sep));
    }

    const series = {}; // icao -> { jetA: [{ d, low, avg }], hundredLL: [{ d, low }] }

    for (const [date, hash] of byDate) {
        let data;
        try {
            data = JSON.parse(git(['show', `${hash}:${FILE}`]));
        } catch {
            continue; // unparseable/renamed snapshot — skip this date
        }
        for (const [icao, ad] of Object.entries(data)) {
            if (icao === '_meta' || !ad || !Array.isArray(ad.fbos)) continue;
            const jetAs = nums(ad.fbos, 'jetA');
            const lls = nums(ad.fbos, 'hundredLL');
            if (!jetAs.length && !lls.length) continue;
            if (!series[icao]) series[icao] = { jetA: [], hundredLL: [] };
            if (jetAs.length) {
                series[icao].jetA.push({
                    d: date,
                    low: +Math.min(...jetAs).toFixed(2),
                    avg: +(jetAs.reduce((s, v) => s + v, 0) / jetAs.length).toFixed(2),
                });
            }
            if (lls.length) {
                series[icao].hundredLL.push({ d: date, low: +Math.min(...lls).toFixed(2) });
            }
        }
    }

    // Only keep airports with enough observations to show a real trend.
    const out = { _meta: { generated: new Date().toISOString(), dates: byDate.size } };
    let kept = 0;
    for (const [icao, s] of Object.entries(series)) {
        if (s.jetA.length >= 2 || s.hundredLL.length >= 2) {
            out[icao] = s;
            kept++;
        }
    }

    writeFileSync(OUT, JSON.stringify(out));
    console.log(`price-history: ${kept} airports across ${byDate.size} dates`);
} catch (err) {
    console.warn('price-history: generation skipped —', err.message);
    // Never block the production build. Keep any existing file; otherwise write an empty one
    // so the static import in data.js always resolves.
    if (!existsSync(OUT)) {
        writeFileSync(OUT, JSON.stringify({ _meta: { generated: new Date().toISOString(), dates: 0 } }));
    }
    process.exit(0);
}
