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
        title: `Cheapest 100LL Fuel in ${stateData.name} — Avgas Prices ${new Date().getFullYear()}`,
        description: `Find the cheapest 100LL avgas prices in ${stateData.name}. Compare FBO fuel prices at airports across ${stateData.name} and save money on aviation fuel.`,
        alternates: { canonical: `/cheapest-100ll/${stateData.slug}/` },
        openGraph: {
            title: `Cheapest 100LL Avgas in ${stateData.name}`,
            description: `Compare 100LL prices at FBOs across ${stateData.name}. Updated daily.`,
            url: `/cheapest-100ll/${stateData.slug}/`,
            type: 'website',
        },
    };
}

export default async function Cheapest100LLStatePage({ params }) {
    const { state } = await params;
    const stateData = states.find(s => s.slug === state);

    if (!stateData) {
        return <div className="container page-content"><h1>State not found</h1></div>;
    }

    const allFBOs = getAllFBOs();
    const stateFBOs = allFBOs
        .filter(fbo => fbo.state === stateData.name && fbo.fuelPrices?.hundredLL)
        .sort((a, b) => (a.fuelPrices?.hundredLL || 999) - (b.fuelPrices?.hundredLL || 999))
        .map((fbo, idx) => ({ ...fbo, rank: idx + 1 }));

    const cheapest = stateFBOs[0];
    const priciest = stateFBOs[stateFBOs.length - 1];
    const avgNum = stateFBOs.length > 0
        ? stateFBOs.reduce((sum, f) => sum + (f.fuelPrices?.hundredLL || 0), 0) / stateFBOs.length
        : null;
    const average = avgNum != null ? avgNum.toFixed(2) : null;
    const spread = stateFBOs.length > 1 ? (priciest.fuelPrices.hundredLL - cheapest.fuelPrices.hundredLL).toFixed(2) : null;
    const belowAvg = avgNum != null ? stateFBOs.filter(f => f.fuelPrices.hundredLL < avgNum).length : 0;
    const airportCount = new Set(stateFBOs.map(f => f.airportCode)).size;
    // Savings on a typical 50-gallon piston top-off, cheapest vs. state average.
    const fillSavings = avgNum != null ? ((avgNum - cheapest.fuelPrices.hundredLL) * 50).toFixed(0) : null;

    const updatedLabel = new Date(getLastUpdated() + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const faqItems = cheapest ? [
        {
            q: `What is the cheapest 100LL avgas in ${stateData.name}?`,
            a: `The cheapest 100LL in ${stateData.name} is $${cheapest.fuelPrices.hundredLL.toFixed(2)}/gal at ${cheapest.name} (${cheapest.airportCode})${cheapest.city ? ` in ${cheapest.city}` : ''}, as of ${updatedLabel}.`,
        },
        average && {
            q: `What is the average 100LL price in ${stateData.name}?`,
            a: `Across ${stateFBOs.length} FBOs reporting 100LL in ${stateData.name}, the average is $${average}/gal${spread ? `, ranging $${cheapest.fuelPrices.hundredLL.toFixed(2)} to $${priciest.fuelPrices.hundredLL.toFixed(2)}/gal` : ''}.`,
        },
        {
            q: `Where is 100LL cheapest for piston aircraft in ${stateData.name}?`,
            a: `${cheapest.city || cheapest.airportCode} (${cheapest.airportCode}) has the lowest 100LL in ${stateData.name} at $${cheapest.fuelPrices.hundredLL.toFixed(2)}/gal. ${belowAvg} of ${stateFBOs.length} FBOs price below the state average.`,
        },
        {
            q: `How often are ${stateData.name} 100LL prices updated?`,
            a: `100LL avgas prices in ${stateData.name} are refreshed daily from AirNav FBO reports; the most recent update was ${updatedLabel}. Confirm with the FBO before fueling.`,
        },
    ].filter(Boolean) : [];

    const crumbs = [
        { label: 'Home', href: '/' },
        { label: 'Cheapest 100LL by State', href: '/cheapest-100ll/' },
        { label: stateData.name },
    ];

    const structuredData = [
        breadcrumbList(crumbs),
        ...(stateFBOs.length
            ? [
                  fboItemList({
                      name: `Cheapest 100LL in ${stateData.name}`,
                      url: `/cheapest-100ll/${stateData.slug}/`,
                      fbos: stateFBOs,
                  }),
                  ...fuelProducts({ contextName: `${stateData.name} (100LL)`, url: `/cheapest-100ll/${stateData.slug}/`, fbos: stateFBOs }),
              ]
            : []),
    ];

    return (
        <div className="page-content">
            <JsonLd data={structuredData} />
            <div className="container">
                <Breadcrumbs items={crumbs} />

                <div className="detail-header" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="detail-icon">LL</div>
                    <div className="detail-header-text">
                        <h1>Cheapest 100LL Avgas in {stateData.name}</h1>
                        <p className="detail-header-subtitle">
                            {stateFBOs.length} FBOs with 100LL pricing · Updated daily
                        </p>
                    </div>
                </div>

                {cheapest && (
                    <div className="claim-banner" style={{ marginBottom: 'var(--space-xl)', background: 'linear-gradient(135deg, #2D8A4E 0%, #1E6B3A 100%)' }}>
                        <div>
                            <h3>Best Price: ${cheapest.fuelPrices.hundredLL.toFixed(2)}/gal</h3>
                            <p>{cheapest.name} at {cheapest.airportCode} in {cheapest.city}</p>
                        </div>
                        <Link href={`/fbo/${cheapest.slug}/`} className="btn">View FBO Details</Link>
                    </div>
                )}

                {average && (
                    <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-text-secondary)' }}>
                        The average 100LL price in {stateData.name} is <strong>${average}/gal</strong>.
                        Below are all FBOs ranked from cheapest to most expensive.
                    </p>
                )}

                {stateFBOs.length > 0 ? (
                    <>
                        <p className="leaderboard-updated">Prices updated daily · Last updated {new Date(getLastUpdated() + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <LeaderboardTable fbos={stateFBOs} showState={false} showAirport={true} />
                    </>
                ) : (
                    <p>No FBOs with 100LL pricing found in {stateData.name}.</p>
                )}

                {stateFBOs.length > 1 && (
                    <div style={{ marginTop: 'var(--space-2xl)' }}>
                        <h2>100LL Avgas Market Analysis in {stateData.name}</h2>
                        <p style={{ marginTop: 'var(--space-md)', lineHeight: '1.8' }}>
                            We track 100LL avgas at <strong>{stateFBOs.length} FBOs</strong> across{' '}
                            <strong>{airportCount} {airportCount === 1 ? 'airport' : 'airports'}</strong> in {stateData.name}.
                            The cheapest 100LL is <strong>${cheapest.fuelPrices.hundredLL.toFixed(2)}/gal</strong> at {cheapest.name} ({cheapest.airportCode}),
                            and the highest is <strong>${priciest.fuelPrices.hundredLL.toFixed(2)}/gal</strong>
                            {spread && <> — a <strong>${spread}/gal</strong> difference depending on where you stop</>}.
                            {' '}{belowAvg} {belowAvg === 1 ? 'FBO is' : 'FBOs are'} below the ${average}/gal state average.
                            {fillSavings && Number(fillSavings) > 0 && (
                                <> For a typical 50-gallon piston top-off, the cheapest stop saves roughly <strong>${Number(fillSavings).toLocaleString()}</strong> versus the average.</>
                            )}
                        </p>
                        <p style={{ marginTop: 'var(--space-md)', lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
                            100LL is the standard fuel for most piston-engine aircraft. Because avgas volumes are smaller than Jet-A, prices are especially
                            sensitive to local supplier logistics and airport traffic. Self-serve pumps usually undercut full-service by a wide margin and are
                            often available 24/7. Figures update daily from AirNav reports.
                        </p>
                    </div>
                )}

                <FAQ items={faqItems} heading={`Cheapest 100LL in ${stateData.name}: FAQ`} />

                <RelatedLinks
                    title="More Fuel Prices"
                    links={[
                        { label: 'Jet-A', title: `Cheapest Jet-A in ${stateData.name}`, href: `/cheapest-jet-a/${stateData.slug}/` },
                        { label: 'Self-Serve', title: `Self-Serve Fuel in ${stateData.name}`, href: `/self-serve-fuel/${stateData.slug}/` },
                        { label: 'State', title: `All FBOs in ${stateData.name}`, href: `/state/${stateData.slug}/` },
                        { label: 'All States', title: 'Cheapest 100LL by State', href: '/cheapest-100ll/' },
                    ]}
                />

                <div className="claim-banner" style={{ marginTop: 'var(--space-2xl)' }}>
                    <div>
                        <h3>Know a better 100LL price in {stateData.name}?</h3>
                        <p>Help fellow pilots save money by reporting current fuel prices.</p>
                    </div>
                    <Link href={`/contact/?topic=price&ref=${stateData.slug}`} className="btn">Report a Price</Link>
                </div>
            </div>
        </div>
    );
}
