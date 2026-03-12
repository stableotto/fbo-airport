import Link from 'next/link';
import { getAllStates, getStateBySlug, getAirportsByState, getRankedFBOsByState, getPriceStats } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeaderboardTable from '@/components/LeaderboardTable';
import PriceStatsBar from '@/components/PriceStatsBar';
import RelatedLinks from '@/components/RelatedLinks';

export function generateStaticParams() {
    return getAllStates().map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const state = getStateBySlug(slug);
    if (!state) return {};
    return {
        title: `Fuel Prices in ${state.name} — Cheapest Jet-A & 100LL`,
        description: `Compare fuel prices at every FBO in ${state.name}. Find the cheapest Jet-A and 100LL across ${state.name} airports.`,
    };
}

export default async function StatePage({ params }) {
    const { slug } = await params;
    const state = getStateBySlug(slug);
    if (!state) return <div className="container page-content"><h1>State not found</h1></div>;

    const rankedFBOs = getRankedFBOsByState(state.name);
    const airports = getAirportsByState(state.name);
    const priceStats = getPriceStats(rankedFBOs);

    return (
        <div className="page-content">
            <div className="container">
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: 'States', href: '/states/' },
                    { label: state.name },
                ]} />

                <div className="section-header">
                    <h1 style={{ fontStyle: 'italic' }}>Fuel Prices in {state.name}</h1>
                </div>

                <p style={{ marginBottom: 'var(--space-lg)', maxWidth: 640 }}>
                    Compare Jet-A and 100LL prices at {rankedFBOs.length} FBOs across {airports.length} airports in {state.name}, ranked from cheapest to most expensive.
                </p>

                <PriceStatsBar stats={priceStats} />

                {airports.length > 1 && (
                    <div style={{ marginBottom: 'var(--space-xl)' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Airports in {state.name}</h3>
                        <div className="airport-chips">
                            {airports.map(apt => (
                                <Link key={apt.icao} href={`/airport/${apt.icao}/`} className="airport-chip">
                                    <strong>{apt.icao}</strong>
                                    <span>{apt.city}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: 'var(--space-lg)' }}>
                    <div className="section-header" style={{ marginBottom: 'var(--space-md)' }}>
                        <h2>Fuel Price Leaderboard</h2>
                        <span className="result-count">{rankedFBOs.length} FBOs in {state.name}</span>
                    </div>
                    <LeaderboardTable fbos={rankedFBOs} showState={false} showAirport={true} />
                </div>

                <RelatedLinks
                    title="Compare Fuel Prices"
                    links={[
                        { label: 'Jet-A', title: `Cheapest Jet-A in ${state.name}`, href: `/cheapest-jet-a/${state.slug}/` },
                        { label: '100LL', title: `Cheapest 100LL in ${state.name}`, href: `/cheapest-100ll/${state.slug}/` },
                        { label: 'Self-Serve', title: `Self-Serve Fuel in ${state.name}`, href: `/self-serve-fuel/${state.slug}/` },
                        { label: 'All States', title: 'Browse All States', href: '/states/' },
                    ]}
                />

                <div className="claim-banner">
                    <div>
                        <h3>Know a better price in {state.name}?</h3>
                        <p>Help pilots save money by reporting the latest fuel prices.</p>
                    </div>
                    <a href="mailto:prices@fboairport.com" className="btn">Report a Price</a>
                </div>
            </div>
        </div>
    );
}
