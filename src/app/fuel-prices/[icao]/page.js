import Link from 'next/link';
import { getAllAirports, getAllFBOs, getAirportByCode, getLastUpdated } from '@/lib/data';
import { states } from '@/data/seed';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeaderboardTable from '@/components/LeaderboardTable';
import RelatedLinks from '@/components/RelatedLinks';
import JsonLd from '@/components/JsonLd';
import { breadcrumbList, fboItemList, fuelProducts, airportSchema } from '@/lib/structured-data';

export function generateStaticParams() {
    return getAllAirports().map(airport => ({ icao: airport.icao }));
}

export async function generateMetadata({ params }) {
    const { icao } = await params;
    const airport = getAirportByCode(icao);
    if (!airport) return {};

    return {
        title: `Fuel Prices at ${icao} — ${airport.name} Jet-A & 100LL`,
        description: `Current fuel prices at ${airport.name} (${icao}). Compare Jet-A and 100LL prices at all FBOs. Find the cheapest aviation fuel at ${icao}.`,
        alternates: { canonical: `/fuel-prices/${icao}/` },
        openGraph: {
            title: `Fuel Prices at ${icao} - ${airport.name}`,
            description: `Compare Jet-A and 100LL prices at ${icao}. Updated daily.`,
            url: `/fuel-prices/${icao}/`,
            type: 'website',
        },
    };
}

export default async function FuelPricesAirportPage({ params }) {
    const { icao } = await params;
    const airport = getAirportByCode(icao);

    if (!airport) {
        return <div className="container page-content"><h1>Airport not found</h1></div>;
    }

    const allFBOs = getAllFBOs();
    const airportFBOs = allFBOs
        .filter(fbo => fbo.airportCode === icao)
        .sort((a, b) => (a.fuelPrices?.jetA || 999) - (b.fuelPrices?.jetA || 999))
        .map((fbo, idx) => ({ ...fbo, rank: fbo.fuelPrices?.jetA ? idx + 1 : null }));

    const stateData = states.find(s => s.name === airport.state);
    const cheapestJetA = airportFBOs.find(f => f.fuelPrices?.jetA);
    const cheapest100LL = airportFBOs
        .filter(f => f.fuelPrices?.hundredLL)
        .sort((a, b) => a.fuelPrices.hundredLL - b.fuelPrices.hundredLL)[0];

    const crumbs = [
        { label: 'Home', href: '/' },
        { label: airport.state, href: stateData ? `/state/${stateData.slug}/` : '/states/' },
        { label: `${icao} Fuel Prices` },
    ];

    const structuredData = [
        breadcrumbList(crumbs),
        airportSchema(airport),
        ...(airportFBOs.length
            ? [
                  fboItemList({
                      name: `Fuel prices at ${icao} ranked cheapest first`,
                      url: `/fuel-prices/${icao}/`,
                      fbos: airportFBOs,
                  }),
                  ...fuelProducts({ contextName: `${icao} (${airport.name})`, url: `/fuel-prices/${icao}/`, fbos: airportFBOs }),
              ]
            : []),
    ];

    return (
        <div className="page-content">
            <JsonLd data={structuredData} />
            <div className="container">
                <Breadcrumbs items={crumbs} />

                <div className="detail-header" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="detail-icon">{icao.slice(1, 3)}</div>
                    <div className="detail-header-text">
                        <h1>Fuel Prices at {icao}</h1>
                        <p className="detail-header-subtitle">
                            {airport.name} · {airport.city}, {airport.state}
                        </p>
                        <div className="tags" style={{ marginTop: '8px' }}>
                            <span className="tag tag--accent">{icao}</span>
                            <span className="tag">{airportFBOs.length} FBOs</span>
                        </div>
                    </div>
                </div>

                {/* Quick Price Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    {cheapestJetA && (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Best Jet-A</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-success)' }}>${cheapestJetA.fuelPrices.jetA.toFixed(2)}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{cheapestJetA.name}</div>
                        </div>
                    )}
                    {cheapest100LL && (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Best 100LL</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-success)' }}>${cheapest100LL.fuelPrices.hundredLL.toFixed(2)}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{cheapest100LL.name}</div>
                        </div>
                    )}
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>FBOs at {icao}</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-accent)' }}>{airportFBOs.length}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Fixed Base Operators</div>
                    </div>
                </div>

                <h2 style={{ marginBottom: 'var(--space-lg)' }}>All FBOs at {icao}</h2>
                <p className="leaderboard-updated">Prices updated daily · Last updated {new Date(getLastUpdated() + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                {airportFBOs.length > 0 ? (
                    <LeaderboardTable fbos={airportFBOs} showState={false} showAirport={false} />
                ) : (
                    <p>No FBOs found at {icao}.</p>
                )}

                <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <h2>About {airport.name}</h2>
                    <p style={{ marginTop: 'var(--space-md)', lineHeight: '1.8' }}>
                        {airport.name} ({icao}) is located in {airport.city}, {airport.state}.
                        {airportFBOs.length > 0 && ` There are ${airportFBOs.length} Fixed Base Operators at this airport offering fuel and services.`}
                        {cheapestJetA && ` The current best Jet-A price is $${cheapestJetA.fuelPrices.jetA.toFixed(2)}/gallon at ${cheapestJetA.name}.`}
                        Prices are updated daily and may vary.
                    </p>
                </div>

                <RelatedLinks
                    title="Compare Prices"
                    links={[
                        { label: 'Airport', title: `All FBOs at ${icao}`, href: `/airport/${icao}/` },
                        { label: 'Jet-A', title: `Cheapest Jet-A in ${airport.state}`, href: `/cheapest-jet-a/${stateData?.slug || 'states'}/` },
                        { label: '100LL', title: `Cheapest 100LL in ${airport.state}`, href: `/cheapest-100ll/${stateData?.slug || 'states'}/` },
                        { label: 'Self-Serve', title: `Self-Serve Fuel in ${airport.state}`, href: `/self-serve-fuel/${stateData?.slug || 'states'}/` },
                    ]}
                />

                <div className="claim-banner" style={{ marginTop: 'var(--space-2xl)' }}>
                    <div>
                        <h3>Know current fuel prices at {icao}?</h3>
                        <p>Help fellow pilots with accurate, up-to-date pricing information.</p>
                    </div>
                    <Link href={`/contact/?topic=price&ref=${icao}`} className="btn">Report a Price</Link>
                </div>
            </div>
        </div>
    );
}
