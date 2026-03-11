/**
 * Generate comprehensive FBO seed data for all airports.
 * Run: node scripts/generate-fbos.mjs
 * Outputs: src/data/fbos-generated.js
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Major FBO chains and their typical characteristics
const chains = [
    { name: 'Signature Flight Support', services: ['Fuel Service', 'Hangar Storage', 'Aircraft Parking', 'Pilot Lounge', 'Free WiFi', 'GPU Available', 'Concierge Service'], fuelTypes: ['Jet-A', '100LL'], website: 'https://signatureflight.com' },
    { name: 'Atlantic Aviation', services: ['Fuel Service', 'Hangar Storage', 'Aircraft Parking', 'Pilot Lounge', 'Free WiFi', 'Ground Transportation'], fuelTypes: ['Jet-A', '100LL'], website: 'https://atlanticaviation.com' },
    { name: 'Jet Aviation', services: ['Fuel Service', 'Hangar Storage', 'Aircraft Parking', 'Aircraft Maintenance', 'Pilot Lounge', 'Concierge Service', 'Free WiFi'], fuelTypes: ['Jet-A'], website: 'https://jetaviation.com' },
    { name: 'Million Air', services: ['Fuel Service', 'Hangar Storage', 'Aircraft Parking', 'Pilot Lounge', 'Crew Car', 'Free WiFi'], fuelTypes: ['Jet-A', '100LL'], website: 'https://millionair.com' },
    { name: 'TAC Air', services: ['Fuel Service', 'Hangar Storage', 'Aircraft Parking', 'Pilot Lounge', 'Crew Car', 'Free WiFi'], fuelTypes: ['Jet-A', '100LL'], website: 'https://tacair.com' },
    { name: 'Sheltair', services: ['Fuel Service', 'Hangar Storage', 'Aircraft Parking', 'Pilot Lounge', 'Free WiFi'], fuelTypes: ['Jet-A', '100LL'], website: 'https://sheltair.com' },
    { name: 'Modern Aviation', services: ['Fuel Service', 'Hangar Storage', 'Aircraft Parking', 'Pilot Lounge', 'GPU Available', 'Catering Service'], fuelTypes: ['Jet-A'], website: 'https://modern-aviation.com' },
    { name: 'Ross Aviation', services: ['Fuel Service', 'Hangar Storage', 'Aircraft Parking', 'Pilot Lounge', 'Crew Car'], fuelTypes: ['Jet-A', '100LL'], website: 'https://rossaviation.com' },
    { name: 'Pentastar Aviation', services: ['Fuel Service', 'Hangar Storage', 'Aircraft Parking', 'Aircraft Maintenance', 'Pilot Lounge', 'Charter Service'], fuelTypes: ['Jet-A', '100LL'], website: 'https://pentastaraviation.com' },
    { name: 'Cutter Aviation', services: ['Fuel Service', 'Hangar Storage', 'Aircraft Parking', 'Aircraft Maintenance', 'Avionics Service', 'Pilot Lounge', 'Free WiFi'], fuelTypes: ['Jet-A', '100LL'], website: 'https://cutteraviation.com' },
];

// Independent FBO name templates
const independentNames = [
    '{city} Jet Center', '{city} Aviation', '{city} Air Center', '{city} FBO',
    '{region} Aero', '{region} Flight Services', '{region} Air Services',
    'Executive Air', 'Premiere Aviation', 'Eagle Aviation', 'Landmark Aviation',
    'Jet Center', 'AirFlite', 'FlightLevel Aviation', 'Summit Aviation',
    'Meridian', 'Priester Aviation', 'Clay Lacy Aviation', 'Banyan Air Service',
    'Epps Aviation', 'Wilson Air Center', 'Fargo Jet Center', 'Yellowstone Jetcenter',
    'Heritage Aviation', 'Jackson Jet Center', 'Scottsdale Jet Center',
    'Fontainebleau Aviation', 'Rocky Mountain FBO', 'Long Beach Jet Center',
    'Jet Source', 'Northeast Air', 'Wisconsin Aviation', 'Jackson Hole Aviation',
    'Maverick Air Center', 'Lane Aviation', 'Elliott Aviation', 'Yingling Aviation',
    'Hawkins & Powers Aviation', 'Alaska Prior Aviation', 'Air Service Hawaii',
    'Yeager Airport FBO', 'Northeast Aviation',
];

// Airport data (ICAO → metadata) - region-based pricing
const regionPricing = {
    northeast: { baseJetA: 7.50, variance: 1.80, base100LL: 6.80, rampBase: 100 },
    southeast: { baseJetA: 6.20, variance: 1.20, base100LL: 5.90, rampBase: 40 },
    midwest: { baseJetA: 5.70, variance: 0.90, base100LL: 5.50, rampBase: 20 },
    southwest: { baseJetA: 6.00, variance: 1.50, base100LL: 5.80, rampBase: 30 },
    west: { baseJetA: 7.00, variance: 2.00, base100LL: 6.50, rampBase: 80 },
    mountain: { baseJetA: 6.20, variance: 1.30, base100LL: 5.90, rampBase: 25 },
    alaska: { baseJetA: 7.80, variance: 1.00, base100LL: 7.40, rampBase: 50 },
    hawaii: { baseJetA: 8.30, variance: 0.80, base100LL: 7.80, rampBase: 75 },
};

const stateRegions = {
    'Connecticut': 'northeast', 'Maine': 'northeast', 'Massachusetts': 'northeast',
    'New Hampshire': 'northeast', 'Rhode Island': 'northeast', 'Vermont': 'northeast',
    'New Jersey': 'northeast', 'New York': 'northeast', 'Pennsylvania': 'northeast',
    'Delaware': 'northeast', 'Maryland': 'northeast',
    'Alabama': 'southeast', 'Florida': 'southeast', 'Georgia': 'southeast',
    'Kentucky': 'southeast', 'Louisiana': 'southeast', 'Mississippi': 'southeast',
    'North Carolina': 'southeast', 'South Carolina': 'southeast', 'Tennessee': 'southeast',
    'Virginia': 'southeast', 'West Virginia': 'southeast', 'Arkansas': 'southeast',
    'Illinois': 'midwest', 'Indiana': 'midwest', 'Iowa': 'midwest', 'Kansas': 'midwest',
    'Michigan': 'midwest', 'Minnesota': 'midwest', 'Missouri': 'midwest',
    'Nebraska': 'midwest', 'North Dakota': 'midwest', 'Ohio': 'midwest',
    'South Dakota': 'midwest', 'Wisconsin': 'midwest',
    'Arizona': 'southwest', 'New Mexico': 'southwest', 'Oklahoma': 'southwest', 'Texas': 'southwest',
    'California': 'west', 'Nevada': 'west', 'Oregon': 'west', 'Washington': 'west',
    'Colorado': 'mountain', 'Idaho': 'mountain', 'Montana': 'mountain',
    'Utah': 'mountain', 'Wyoming': 'mountain',
    'Alaska': 'alaska', 'Hawaii': 'hawaii',
};

// Airports with their states and cities
const airports = [
    ['KATL', 'Atlanta', 'Georgia'], ['KORD', 'Chicago', 'Illinois'], ['KDFW', 'Dallas', 'Texas'],
    ['KDEN', 'Denver', 'Colorado'], ['KJFK', 'New York', 'New York'], ['KLAX', 'Los Angeles', 'California'],
    ['KSFO', 'San Francisco', 'California'], ['KLAS', 'Las Vegas', 'Nevada'], ['KMIA', 'Miami', 'Florida'],
    ['KSEA', 'Seattle', 'Washington'], ['KMCO', 'Orlando', 'Florida'], ['KPHX', 'Phoenix', 'Arizona'],
    ['KIAH', 'Houston', 'Texas'], ['KBOS', 'Boston', 'Massachusetts'], ['KMSP', 'Minneapolis', 'Minnesota'],
    ['KDTW', 'Detroit', 'Michigan'], ['KPHL', 'Philadelphia', 'Pennsylvania'], ['KEWR', 'Newark', 'New Jersey'],
    ['KFLL', 'Fort Lauderdale', 'Florida'], ['KBWI', 'Baltimore', 'Maryland'],
    ['KSLC', 'Salt Lake City', 'Utah'], ['KDCA', 'Washington', 'Virginia'], ['KIAD', 'Dulles', 'Virginia'],
    ['KSAN', 'San Diego', 'California'], ['KTPA', 'Tampa', 'Florida'], ['KPDX', 'Portland', 'Oregon'],
    ['KSTL', 'St. Louis', 'Missouri'], ['KBNA', 'Nashville', 'Tennessee'], ['KAUS', 'Austin', 'Texas'],
    ['KSAT', 'San Antonio', 'Texas'], ['KCLT', 'Charlotte', 'North Carolina'],
    ['KRDU', 'Raleigh', 'North Carolina'], ['KMSY', 'New Orleans', 'Louisiana'],
    ['KCLE', 'Cleveland', 'Ohio'], ['KCMH', 'Columbus', 'Ohio'], ['KIND', 'Indianapolis', 'Indiana'],
    ['KMCI', 'Kansas City', 'Missouri'], ['KMKE', 'Milwaukee', 'Wisconsin'],
    ['KSDF', 'Louisville', 'Kentucky'], ['KPIT', 'Pittsburgh', 'Pennsylvania'],
    ['KOKC', 'Oklahoma City', 'Oklahoma'], ['KRIC', 'Richmond', 'Virginia'],
    ['KCHS', 'Charleston', 'South Carolina'], ['KABQ', 'Albuquerque', 'New Mexico'],
    ['KOMA', 'Omaha', 'Nebraska'], ['KDSM', 'Des Moines', 'Iowa'], ['KICT', 'Wichita', 'Kansas'],
    ['KLIT', 'Little Rock', 'Arkansas'], ['KBHM', 'Birmingham', 'Alabama'],
    ['PANC', 'Anchorage', 'Alaska'], ['PHNL', 'Honolulu', 'Hawaii'],
    ['KBDL', 'Hartford', 'Connecticut'], ['KILG', 'Wilmington', 'Delaware'],
    ['KBOI', 'Boise', 'Idaho'], ['KFAR', 'Fargo', 'North Dakota'],
    ['KPVD', 'Providence', 'Rhode Island'], ['KFSD', 'Sioux Falls', 'South Dakota'],
    ['KJAN', 'Jackson', 'Mississippi'], ['KBZN', 'Bozeman', 'Montana'],
    ['KPWM', 'Portland', 'Maine'], ['KBTV', 'Burlington', 'Vermont'],
    ['KCRW', 'Charleston', 'West Virginia'], ['KJAC', 'Jackson', 'Wyoming'],
    ['KSAV', 'Savannah', 'Georgia'], ['KPBI', 'West Palm Beach', 'Florida'],
    ['KRSW', 'Fort Myers', 'Florida'], ['KJAX', 'Jacksonville', 'Florida'],
    ['KTUL', 'Tulsa', 'Oklahoma'], ['KMEM', 'Memphis', 'Tennessee'],
    ['KSYR', 'Syracuse', 'New York'], ['KBUF', 'Buffalo', 'New York'],
    ['KROC', 'Rochester', 'New York'], ['KALB', 'Albany', 'New York'],
    ['KELP', 'El Paso', 'Texas'], ['KTUS', 'Tucson', 'Arizona'],
    ['KCOS', 'Colorado Springs', 'Colorado'], ['KRNO', 'Reno', 'Nevada'],
    ['KSMF', 'Sacramento', 'California'], ['KSJC', 'San Jose', 'California'],
    ['KOAK', 'Oakland', 'California'], ['KSNA', 'Santa Ana', 'California'],
    ['KGRR', 'Grand Rapids', 'Michigan'], ['KMSN', 'Madison', 'Wisconsin'],
    // GA airports
    ['KTEB', 'Teterboro', 'New Jersey'], ['KVNY', 'Van Nuys', 'California'],
    ['KSDL', 'Scottsdale', 'Arizona'], ['KAPA', 'Englewood', 'Colorado'],
    ['KPDK', 'Atlanta', 'Georgia'], ['KFXE', 'Fort Lauderdale', 'Florida'],
    ['KOPF', 'Opa-locka', 'Florida'], ['KHPN', 'White Plains', 'New York'],
    ['KCHA', 'Chattanooga', 'Tennessee'], ['KHOU', 'Houston', 'Texas'],
    ['KBJC', 'Broomfield', 'Colorado'], ['KCRQ', 'Carlsbad', 'California'],
    ['KLGB', 'Long Beach', 'California'], ['KPNE', 'Philadelphia', 'Pennsylvania'],
    ['KJNU', 'Juneau', 'Alaska'], ['KFRG', 'Farmingdale', 'New York'],
    ['KPWK', 'Wheeling', 'Illinois'], ['KDPA', 'West Chicago', 'Illinois'],
    ['KADS', 'Addison', 'Texas'], ['KDAL', 'Dallas', 'Texas'],
    ['KFTW', 'Fort Worth', 'Texas'], ['KSGR', 'Sugar Land', 'Texas'],
    ['KNEW', 'New Orleans', 'Louisiana'], ['KBTR', 'Baton Rouge', 'Louisiana'],
    ['KAPF', 'Naples', 'Florida'], ['KORL', 'Orlando', 'Florida'],
    ['KSRQ', 'Sarasota', 'Florida'], ['KLAL', 'Lakeland', 'Florida'],
    ['KVPS', 'Destin', 'Florida'], ['KTMB', 'Miami', 'Florida'],
    ['KBED', 'Bedford', 'Massachusetts'], ['KSWF', 'New Windsor', 'New York'],
    ['KISP', 'Islip', 'New York'], ['KHEF', 'Manassas', 'Virginia'],
    ['KAVL', 'Asheville', 'North Carolina'], ['KGSP', 'Greenville', 'South Carolina'],
    ['KMYR', 'Myrtle Beach', 'South Carolina'], ['KHSV', 'Huntsville', 'Alabama'],
    ['KMOB', 'Mobile', 'Alabama'], ['KMGM', 'Montgomery', 'Alabama'],
    ['KGNV', 'Gainesville', 'Florida'], ['KTLH', 'Tallahassee', 'Florida'],
    ['KPNS', 'Pensacola', 'Florida'], ['KLFT', 'Lafayette', 'Louisiana'],
    ['KSHV', 'Shreveport', 'Louisiana'], ['KGPT', 'Gulfport', 'Mississippi'],
    ['KSGF', 'Springfield', 'Missouri'], ['KLEX', 'Lexington', 'Kentucky'],
    ['KCVG', 'Hebron', 'Kentucky'], ['KDAY', 'Dayton', 'Ohio'],
    ['KCAK', 'Akron', 'Ohio'], ['KFWA', 'Fort Wayne', 'Indiana'],
    ['KSBN', 'South Bend', 'Indiana'], ['KLAN', 'Lansing', 'Michigan'],
    ['KPTK', 'Pontiac', 'Michigan'], ['KFCM', 'Eden Prairie', 'Minnesota'],
    ['KDLH', 'Duluth', 'Minnesota'], ['KBFI', 'Seattle', 'Washington'],
    ['KPAE', 'Everett', 'Washington'], ['KGEG', 'Spokane', 'Washington'],
    ['KSBA', 'Santa Barbara', 'California'], ['KCMA', 'Camarillo', 'California'],
    ['KSEE', 'El Cajon', 'California'], ['KMYF', 'San Diego', 'California'],
    ['KFFZ', 'Mesa', 'Arizona'], ['KIWA', 'Mesa', 'Arizona'],
    ['KDVT', 'Phoenix', 'Arizona'], ['KVGT', 'North Las Vegas', 'Nevada'],
    ['KHND', 'Henderson', 'Nevada'], ['KBIL', 'Billings', 'Montana'],
    ['KMSO', 'Missoula', 'Montana'], ['KGTF', 'Great Falls', 'Montana'],
    ['KEUG', 'Eugene', 'Oregon'], ['KHIO', 'Hillsboro', 'Oregon'],
    ['KEGE', 'Eagle', 'Colorado'], ['KASE', 'Aspen', 'Colorado'],
    ['KGJT', 'Grand Junction', 'Colorado'], ['KRAP', 'Rapid City', 'South Dakota'],
    ['KBIS', 'Bismarck', 'North Dakota'], ['KGFK', 'Grand Forks', 'North Dakota'],
    ['KSUN', 'Hailey', 'Idaho'], ['KPVU', 'Provo', 'Utah'],
    ['KOGD', 'Ogden', 'Utah'], ['KCYS', 'Cheyenne', 'Wyoming'],
    ['PAFA', 'Fairbanks', 'Alaska'], ['PAMR', 'Anchorage', 'Alaska'],
    ['PHOG', 'Kahului', 'Hawaii'], ['PHKO', 'Kailua-Kona', 'Hawaii'],
    ['KSAF', 'Santa Fe', 'New Mexico'], ['KFNL', 'Fort Collins', 'Colorado'],
    ['KLNK', 'Lincoln', 'Nebraska'], ['KMKC', 'Kansas City', 'Missouri'],
    ['KSPI', 'Springfield', 'Illinois'],
];

function rand(min, max) { return +(min + Math.random() * (max - min)).toFixed(2); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function slug(name, icao) { return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') + '-' + icao.toLowerCase(); }

// Seed RNG for reproducibility
let seed = 42;
function seededRand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
function srand(min, max) { return +(min + seededRand() * (max - min)).toFixed(2); }
function spick(arr) { return arr[Math.floor(seededRand() * arr.length)]; }

const fbos = [];
const usedSlugs = new Set();

for (const [icao, city, state] of airports) {
    const region = stateRegions[state] || 'midwest';
    const pricing = regionPricing[region];

    // Determine how many FBOs at this airport (1-4 based on airport size)
    const majorAirports = ['KATL', 'KORD', 'KDFW', 'KDEN', 'KJFK', 'KLAX', 'KSFO', 'KLAS', 'KMIA', 'KSEA', 'KMCO', 'KPHX', 'KIAH', 'KBOS', 'KMSP', 'KDTW', 'KPHL', 'KEWR', 'KFLL', 'KBWI', 'KSLC', 'KTEB', 'KVNY', 'KSDL', 'KPDK', 'KFXE', 'KDAL', 'KHOU'];
    const mediumAirports = ['KBNA', 'KAUS', 'KSAT', 'KCLT', 'KRDU', 'KMSY', 'KCLE', 'KCMH', 'KIND', 'KMCI', 'KPIT', 'KSAN', 'KTPA', 'KPDX', 'KSTL', 'KPBI', 'KJAX', 'KTUL', 'KSMF', 'KOAK', 'KSNA', 'KAPA', 'KBJC', 'KOPF', 'KHPN', 'KPWK', 'KADS', 'KFTW', 'KAPF', 'KORL', 'KBED', 'KISP', 'KBFI', 'KPAE'];

    let numFBOs;
    if (majorAirports.includes(icao)) numFBOs = 2 + Math.floor(seededRand() * 3); // 2-4
    else if (mediumAirports.includes(icao)) numFBOs = 2 + Math.floor(seededRand() * 2); // 2-3
    else numFBOs = 1 + Math.floor(seededRand() * 2); // 1-2

    const usedChains = new Set();

    for (let i = 0; i < numFBOs; i++) {
        let fboData;
        const useChain = seededRand() > 0.35 && i < 2;

        if (useChain) {
            let chain;
            let attempts = 0;
            do {
                chain = spick(chains);
                attempts++;
            } while (usedChains.has(chain.name) && attempts < 20);
            if (usedChains.has(chain.name)) continue;
            usedChains.add(chain.name);

            fboData = {
                name: chain.name,
                services: [...chain.services],
                fuelTypes: [...chain.fuelTypes],
                website: chain.website,
            };
        } else {
            // Independent FBO
            const template = spick(independentNames);
            let name = template.replace('{city}', city).replace('{region}', state.split(' ')[0]);
            // Ensure unique name per airport
            if (fbos.some(f => f.name === name && f.airportCode === icao)) {
                name = `${city} Executive Aviation`;
            }
            const extraServices = ['Flight Instruction', 'Aircraft Rental', 'De-icing', 'Oxygen Service', 'Lavatory Service', 'Weather Briefing', 'Charter Service'];
            const baseServices = ['Fuel Service', 'Hangar Storage', 'Aircraft Parking', 'Pilot Lounge'];
            const additional = [];
            for (const s of extraServices) {
                if (seededRand() > 0.6) additional.push(s);
            }
            if (seededRand() > 0.4) additional.push('Free WiFi');
            if (seededRand() > 0.5) additional.push('Crew Car');

            fboData = {
                name,
                services: [...baseServices, ...additional],
                fuelTypes: seededRand() > 0.2 ? ['Jet-A', '100LL'] : ['Jet-A'],
                website: null,
            };
        }

        // Generate pricing
        const jetA = srand(pricing.baseJetA - pricing.variance * 0.3, pricing.baseJetA + pricing.variance * 0.7);
        const hasSelfServe = seededRand() > 0.6;
        const has100LL = fboData.fuelTypes.includes('100LL');
        const rampFeeChance = seededRand();
        let rampFee = 0;
        if (rampFeeChance > 0.5) rampFee = Math.round(srand(pricing.rampBase * 0.5, pricing.rampBase * 2.5) / 25) * 25;

        const fboSlug = slug(fboData.name, icao);
        if (usedSlugs.has(fboSlug)) continue;
        usedSlugs.add(fboSlug);

        fbos.push({
            slug: fboSlug,
            name: fboData.name,
            airportCode: icao,
            state,
            city,
            services: fboData.services,
            fuelTypes: fboData.fuelTypes,
            phone: `(${Math.floor(200 + seededRand() * 800)}) ${Math.floor(200 + seededRand() * 800)}-${String(Math.floor(seededRand() * 10000)).padStart(4, '0')}`,
            website: fboData.website,
            email: null,
            hours: seededRand() > 0.3 ? '24/7' : `${Math.floor(6 + seededRand() * 2)}:00 AM - ${Math.floor(8 + seededRand() * 3)}:00 PM`,
            description: `${fboData.name} is a full-service fixed-base operator located at ${icao} in ${city}, ${state}. Providing premium aviation services to private and corporate aircraft.`,
            fuelPrices: {
                jetA,
                jetASelfServe: hasSelfServe ? srand(jetA - 0.65, jetA - 0.30) : null,
                hundredLL: has100LL ? srand(pricing.base100LL - 0.30, pricing.base100LL + pricing.variance * 0.5) : null,
            },
            rampFee,
            rampFeeWaived: rampFee > 0 ? `With fuel purchase${rampFee > 100 ? ` of ${Math.round(rampFee / 5)}+ gallons` : ''}` : null,
            priceUpdated: '2026-03-03',
        });
    }
}

// Write output
const output = `// Auto-generated FBO data — ${fbos.length} FBOs across ${new Set(fbos.map(f => f.airportCode)).size} airports
// Generated: ${new Date().toISOString().split('T')[0]}
// To regenerate: node scripts/generate-fbos.mjs

export const fbos = ${JSON.stringify(fbos, null, 2)};
`;

const outPath = join(__dirname, '..', 'src', 'data', 'fbos.js');
writeFileSync(outPath, output);
console.log(`✅ Generated ${fbos.length} FBOs across ${new Set(fbos.map(f => f.airportCode)).size} airports`);
console.log(`   Written to: ${outPath}`);
