import Link from 'next/link';
import { states } from '@/data/seed';
import { getAllFBOs } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeaderboardTable from '@/components/LeaderboardTable';
import RelatedLinks from '@/components/RelatedLinks';

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
        openGraph: {
            title: `Cheapest 100LL Avgas in ${stateData.name}`,
            description: `Compare 100LL prices at FBOs across ${stateData.name}. Updated daily.`,
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
    const average = stateFBOs.length > 0
        ? (stateFBOs.reduce((sum, f) => sum + (f.fuelPrices?.hundredLL || 0), 0) / stateFBOs.length).toFixed(2)
        : null;

    return (
        <div className="page-content">
            <div className="container">
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: 'Cheapest 100LL by State', href: '/cheapest-100ll/' },
                    { label: stateData.name },
                ]} />

                <div className="detail-header" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="detail-icon">⛽</div>
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
                    <LeaderboardTable fbos={stateFBOs} showState={false} showAirport={true} />
                ) : (
                    <p>No FBOs with 100LL pricing found in {stateData.name}.</p>
                )}

                <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <h2>About 100LL Avgas Prices in {stateData.name}</h2>
                    <p style={{ marginTop: 'var(--space-md)', lineHeight: '1.8' }}>
                        100LL (low-lead aviation gasoline) is the standard fuel for piston-engine aircraft.
                        Prices in {stateData.name} vary based on location, competition, and supplier contracts.
                        Self-serve pumps typically offer lower prices than full-service fueling.
                        Prices are updated daily and may vary based on current market conditions.
                    </p>
                </div>

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
                    <a href={`mailto:prices@fboairport.com?subject=100LL Price Update - ${stateData.name}`} className="btn">Report a Price</a>
                </div>
            </div>
        </div>
    );
}
