import Link from 'next/link';
import { states } from '@/data/seed';
import { getAllFBOs, getLastUpdated } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeaderboardTable from '@/components/LeaderboardTable';
import FAQ from '@/components/FAQ';
import RelatedLinks from '@/components/RelatedLinks';
import JsonLd from '@/components/JsonLd';
import { breadcrumbList, fboItemList, fuelProducts } from '@/lib/structured-data';

export function generateStaticParams() {
    return states.map(state => ({ state: state.slug }));
}

export async function generateMetadata({ params }) {
    const { state } = await params;
    const stateData = states.find(s => s.slug === state);
    if (!stateData) return {};

    return {
        title: `Cheapest Jet-A Fuel in ${stateData.name} — Best Prices ${new Date().getFullYear()}`,
        description: `Find the cheapest Jet-A fuel prices in ${stateData.name}. Compare FBO fuel prices at airports across ${stateData.name} and save money on aviation fuel.`,
        alternates: { canonical: `/cheapest-jet-a/${stateData.slug}/` },
        openGraph: {
            title: `Cheapest Jet-A Fuel in ${stateData.name}`,
            description: `Compare Jet-A prices at FBOs across ${stateData.name}. Updated daily.`,
            url: `/cheapest-jet-a/${stateData.slug}/`,
            type: 'website',
        },
    };
}

export default async function CheapestJetAStatePage({ params }) {
    const { state } = await params;
    const stateData = states.find(s => s.slug === state);

    if (!stateData) {
        return <div className="container page-content"><h1>State not found</h1></div>;
    }

    const allFBOs = getAllFBOs();
    const stateFBOs = allFBOs
        .filter(fbo => fbo.state === stateData.name && fbo.fuelPrices?.jetA)
        .sort((a, b) => (a.fuelPrices?.jetA || 999) - (b.fuelPrices?.jetA || 999))
        .map((fbo, idx) => ({ ...fbo, rank: idx + 1 }));

    const cheapest = stateFBOs[0];
    const priciest = stateFBOs[stateFBOs.length - 1];
    const avgNum = stateFBOs.length > 0
        ? stateFBOs.reduce((sum, f) => sum + (f.fuelPrices?.jetA || 0), 0) / stateFBOs.length
        : null;
    const average = avgNum != null ? avgNum.toFixed(2) : null;
    const spread = stateFBOs.length > 1 ? (priciest.fuelPrices.jetA - cheapest.fuelPrices.jetA).toFixed(2) : null;
    const belowAvg = avgNum != null ? stateFBOs.filter(f => f.fuelPrices.jetA < avgNum).length : 0;
    const airportCount = new Set(stateFBOs.map(f => f.airportCode)).size;
    // Savings on a typical 180-gallon turbine top-off, cheapest vs. state average.
    const fillSavings = avgNum != null ? ((avgNum - cheapest.fuelPrices.jetA) * 180).toFixed(0) : null;

    const updatedLabel = new Date(getLastUpdated() + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const faqItems = cheapest ? [
        {
            q: `What is the cheapest Jet-A fuel in ${stateData.name}?`,
            a: `The cheapest Jet-A in ${stateData.name} is $${cheapest.fuelPrices.jetA.toFixed(2)}/gal at ${cheapest.name} (${cheapest.airportCode})${cheapest.city ? ` in ${cheapest.city}` : ''}, as of ${updatedLabel}.`,
        },
        average && {
            q: `What is the average Jet-A price in ${stateData.name}?`,
            a: `Across ${stateFBOs.length} FBOs reporting Jet-A in ${stateData.name}, the average price is $${average}/gal${spread ? `, spanning $${cheapest.fuelPrices.jetA.toFixed(2)} to $${priciest.fuelPrices.jetA.toFixed(2)}/gal` : ''}.`,
        },
        {
            q: `Where is Jet-A cheapest in ${stateData.name}?`,
            a: `${cheapest.city || cheapest.airportCode} (${cheapest.airportCode}) currently has the lowest Jet-A in ${stateData.name} at $${cheapest.fuelPrices.jetA.toFixed(2)}/gal. ${belowAvg} of ${stateFBOs.length} FBOs price below the state average.`,
        },
        {
            q: `How often are ${stateData.name} Jet-A prices updated?`,
            a: `Jet-A prices in ${stateData.name} are refreshed daily from AirNav FBO reports; the most recent update was ${updatedLabel}. Confirm with the FBO before fueling.`,
        },
    ].filter(Boolean) : [];

    const crumbs = [
        { label: 'Home', href: '/' },
        { label: 'Cheapest Jet-A by State', href: '/cheapest-jet-a/' },
        { label: stateData.name },
    ];

    const structuredData = [
        breadcrumbList(crumbs),
        ...(stateFBOs.length
            ? [
                  fboItemList({
                      name: `Cheapest Jet-A in ${stateData.name}`,
                      url: `/cheapest-jet-a/${stateData.slug}/`,
                      fbos: stateFBOs,
                  }),
                  ...fuelProducts({ contextName: `${stateData.name} (Jet-A)`, url: `/cheapest-jet-a/${stateData.slug}/`, fbos: stateFBOs }),
              ]
            : []),
    ];

    return (
        <div className="page-content">
            <JsonLd data={structuredData} />
            <div className="container">
                <Breadcrumbs items={crumbs} />

                <div className="detail-header" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="detail-icon">JA</div>
                    <div className="detail-header-text">
                        <h1>Cheapest Jet-A Fuel in {stateData.name}</h1>
                        <p className="detail-header-subtitle">
                            {stateFBOs.length} FBOs with Jet-A pricing · Updated daily
                        </p>
                    </div>
                </div>

                {cheapest && (
                    <div className="claim-banner" style={{ marginBottom: 'var(--space-xl)', background: 'linear-gradient(135deg, #2D8A4E 0%, #1E6B3A 100%)' }}>
                        <div>
                            <h3>Best Price: ${cheapest.fuelPrices.jetA.toFixed(2)}/gal</h3>
                            <p>{cheapest.name} at {cheapest.airportCode} in {cheapest.city}</p>
                        </div>
                        <Link href={`/fbo/${cheapest.slug}/`} className="btn">View FBO Details</Link>
                    </div>
                )}

                {average && (
                    <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-text-secondary)' }}>
                        The average Jet-A price in {stateData.name} is <strong>${average}/gal</strong>.
                        Below are all FBOs ranked from cheapest to most expensive.
                    </p>
                )}

                <p className="leaderboard-updated">Prices updated daily · Last updated {new Date(getLastUpdated() + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <LeaderboardTable fbos={stateFBOs} showState={false} showAirport={true} />

                {stateFBOs.length > 1 && (
                    <div style={{ marginTop: 'var(--space-2xl)' }}>
                        <h2>Jet-A Market Analysis in {stateData.name}</h2>
                        <p style={{ marginTop: 'var(--space-md)', lineHeight: '1.8' }}>
                            We track Jet-A pricing at <strong>{stateFBOs.length} FBOs</strong> across{' '}
                            <strong>{airportCount} {airportCount === 1 ? 'airport' : 'airports'}</strong> in {stateData.name}.
                            The cheapest Jet-A is <strong>${cheapest.fuelPrices.jetA.toFixed(2)}/gal</strong> at {cheapest.name} ({cheapest.airportCode}),
                            while the most expensive runs <strong>${priciest.fuelPrices.jetA.toFixed(2)}/gal</strong> at {priciest.airportCode}
                            {spread && <> — a spread of <strong>${spread}/gal</strong></>}.
                            {' '}{belowAvg} {belowAvg === 1 ? 'FBO is' : 'FBOs are'} priced below the state average of ${average}/gal.
                            {fillSavings && Number(fillSavings) > 0 && (
                                <> On a typical 180-gallon turbine top-off, fueling at the cheapest FBO instead of the state average saves about <strong>${Number(fillSavings).toLocaleString()}</strong>.</>
                            )}
                        </p>
                        <p style={{ marginTop: 'var(--space-md)', lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
                            Jet-A prices move with crude markets, supplier contracts, airport competition, and volume discounts. Full-service fueling
                            carries an into-plane fee that self-serve avoids, so comparing both is worthwhile on longer fills. Rankings update daily from
                            AirNav FBO reports.
                        </p>
                    </div>
                )}

                <FAQ items={faqItems} heading={`Cheapest Jet-A in ${stateData.name}: FAQ`} />

                <RelatedLinks
                    title="More Fuel Prices"
                    links={[
                        { label: '100LL', title: `Cheapest 100LL in ${stateData.name}`, href: `/cheapest-100ll/${stateData.slug}/` },
                        { label: 'Self-Serve', title: `Self-Serve Fuel in ${stateData.name}`, href: `/self-serve-fuel/${stateData.slug}/` },
                        { label: 'State', title: `All FBOs in ${stateData.name}`, href: `/state/${stateData.slug}/` },
                        { label: 'All States', title: 'Cheapest Jet-A by State', href: '/cheapest-jet-a/' },
                    ]}
                />

                <div className="claim-banner" style={{ marginTop: 'var(--space-2xl)' }}>
                    <div>
                        <h3>Know a better price in {stateData.name}?</h3>
                        <p>Help fellow pilots save money by reporting current fuel prices.</p>
                    </div>
                    <Link href={`/contact/?topic=price&ref=${stateData.slug}`} className="btn">Report a Price</Link>
                </div>
            </div>
        </div>
    );
}
