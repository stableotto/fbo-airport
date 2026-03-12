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
        title: `Self-Serve Fuel in ${stateData.name} — Cheapest Self-Service Avgas & Jet-A`,
        description: `Find self-serve fuel prices in ${stateData.name}. Save money with self-service Jet-A and 100LL at FBOs across ${stateData.name}.`,
        openGraph: {
            title: `Self-Serve Aviation Fuel in ${stateData.name}`,
            description: `Self-service fuel prices at FBOs in ${stateData.name}. Updated daily.`,
        },
    };
}

export default async function SelfServeFuelStatePage({ params }) {
    const { state } = await params;
    const stateData = states.find(s => s.slug === state);

    if (!stateData) {
        return <div className="container page-content"><h1>State not found</h1></div>;
    }

    const allFBOs = getAllFBOs();

    // Filter FBOs that have self-serve fuel
    const selfServeFBOs = allFBOs
        .filter(fbo => fbo.state === stateData.name && fbo.fuelPrices?.jetASelfServe)
        .sort((a, b) => (a.fuelPrices?.jetASelfServe || 999) - (b.fuelPrices?.jetASelfServe || 999))
        .map((fbo, idx) => ({
            ...fbo,
            rank: idx + 1,
            // Override jetA with self-serve for display
            fuelPrices: {
                ...fbo.fuelPrices,
                jetA: fbo.fuelPrices.jetASelfServe,
            },
        }));

    const cheapest = selfServeFBOs[0];

    // Calculate average savings vs full-serve
    const fbosWithBoth = allFBOs.filter(fbo =>
        fbo.state === stateData.name &&
        fbo.fuelPrices?.jetA &&
        fbo.fuelPrices?.jetASelfServe
    );
    const avgSavings = fbosWithBoth.length > 0
        ? (fbosWithBoth.reduce((sum, f) => sum + (f.fuelPrices.jetA - f.fuelPrices.jetASelfServe), 0) / fbosWithBoth.length).toFixed(2)
        : null;

    return (
        <div className="page-content">
            <div className="container">
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: 'Self-Serve Fuel by State', href: '/self-serve-fuel/' },
                    { label: stateData.name },
                ]} />

                <div className="detail-header" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="detail-icon">⛽</div>
                    <div className="detail-header-text">
                        <h1>Self-Serve Fuel in {stateData.name}</h1>
                        <p className="detail-header-subtitle">
                            {selfServeFBOs.length} FBOs with self-service fuel · Updated daily
                        </p>
                    </div>
                </div>

                {cheapest && (
                    <div className="claim-banner" style={{ marginBottom: 'var(--space-xl)', background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)' }}>
                        <div>
                            <h3>Best Self-Serve: ${cheapest.fuelPrices.jetA.toFixed(2)}/gal</h3>
                            <p>{cheapest.name} at {cheapest.airportCode} in {cheapest.city}</p>
                        </div>
                        <Link href={`/fbo/${cheapest.slug}/`} className="btn">View FBO Details</Link>
                    </div>
                )}

                {avgSavings && (
                    <div style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'var(--color-bg-alt)', borderRadius: 'var(--border-radius-lg)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Average Self-Serve Savings</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-success)' }}>${avgSavings}/gal</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>compared to full-service in {stateData.name}</div>
                    </div>
                )}

                <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-text-secondary)' }}>
                    Self-serve fuel pumps let you fuel your own aircraft at a lower price.
                    Below are all FBOs in {stateData.name} offering self-service fuel, ranked by price.
                </p>

                {selfServeFBOs.length > 0 ? (
                    <LeaderboardTable fbos={selfServeFBOs} showState={false} showAirport={true} />
                ) : (
                    <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                        <p>No FBOs with self-serve fuel pricing found in {stateData.name}.</p>
                        <p style={{ marginTop: 'var(--space-sm)', fontSize: '0.9rem', color: 'var(--color-text-tertiary)' }}>
                            Know an FBO with self-serve? <a href="mailto:prices@fboairport.com">Report it</a>.
                        </p>
                    </div>
                )}

                <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <h2>Why Choose Self-Serve Fuel?</h2>
                    <p style={{ marginTop: 'var(--space-md)', lineHeight: '1.8' }}>
                        Self-serve fuel stations typically offer savings of $0.30-$1.00+ per gallon compared to full-service.
                        For a 50-gallon fill-up, that's $15-$50 in savings. Self-serve is available 24/7 at many locations,
                        making it convenient for early departures or late arrivals. Most self-serve pumps accept major credit cards
                        and aviation fuel cards.
                    </p>
                </div>

                <RelatedLinks
                    title="More Fuel Prices"
                    links={[
                        { label: 'Jet-A', title: `Cheapest Jet-A in ${stateData.name}`, href: `/cheapest-jet-a/${stateData.slug}/` },
                        { label: '100LL', title: `Cheapest 100LL in ${stateData.name}`, href: `/cheapest-100ll/${stateData.slug}/` },
                        { label: 'State', title: `All FBOs in ${stateData.name}`, href: `/state/${stateData.slug}/` },
                        { label: 'All States', title: 'Self-Serve Fuel by State', href: '/self-serve-fuel/' },
                    ]}
                />

                <div className="claim-banner" style={{ marginTop: 'var(--space-2xl)' }}>
                    <div>
                        <h3>Know a self-serve location in {stateData.name}?</h3>
                        <p>Help fellow pilots find cheaper fuel options.</p>
                    </div>
                    <a href={`mailto:prices@fboairport.com?subject=Self-Serve Fuel Location - ${stateData.name}`} className="btn">Report a Location</a>
                </div>
            </div>
        </div>
    );
}
