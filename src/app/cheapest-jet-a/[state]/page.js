import Link from 'next/link';
import { states } from '@/data/seed';
import { getAllFBOs } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeaderboardTable from '@/components/LeaderboardTable';

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
        openGraph: {
            title: `Cheapest Jet-A Fuel in ${stateData.name}`,
            description: `Compare Jet-A prices at FBOs across ${stateData.name}. Updated daily.`,
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
    const average = stateFBOs.length > 0
        ? (stateFBOs.reduce((sum, f) => sum + (f.fuelPrices?.jetA || 0), 0) / stateFBOs.length).toFixed(2)
        : null;

    return (
        <div className="page-content">
            <div className="container">
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: 'Cheapest Jet-A by State', href: '/cheapest-jet-a/' },
                    { label: stateData.name },
                ]} />

                <div className="detail-header" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="detail-icon">⛽</div>
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

                <LeaderboardTable fbos={stateFBOs} showState={false} showAirport={true} />

                <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <h2>About Jet-A Fuel Prices in {stateData.name}</h2>
                    <p style={{ marginTop: 'var(--space-md)', lineHeight: '1.8' }}>
                        Jet-A fuel prices in {stateData.name} vary significantly between FBOs and airports.
                        Factors affecting price include location, competition, fuel supplier contracts, and volume discounts.
                        Self-serve fuel is typically cheaper than full-service, and some FBOs waive ramp fees with fuel purchases.
                        Prices are updated daily from FBO reports and may vary based on current market conditions.
                    </p>
                </div>

                <div className="claim-banner" style={{ marginTop: 'var(--space-2xl)' }}>
                    <div>
                        <h3>Know a better price in {stateData.name}?</h3>
                        <p>Help fellow pilots save money by reporting current fuel prices.</p>
                    </div>
                    <a href={`mailto:prices@fboairport.com?subject=Fuel Price Update - ${stateData.name}`} className="btn">Report a Price</a>
                </div>
            </div>
        </div>
    );
}
