import Link from 'next/link';
import { getAllAirports, getAirportByCode, getRankedFBOsByAirport, getPriceStats } from '@/lib/data';
import { states } from '@/data/seed';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeaderboardTable from '@/components/LeaderboardTable';
import PriceStatsBar from '@/components/PriceStatsBar';

export function generateStaticParams() {
    return getAllAirports().map(a => ({ icao: a.icao }));
}

export async function generateMetadata({ params }) {
    const { icao } = await params;
    const airport = getAirportByCode(icao);
    if (!airport) return {};
    const rankedFBOs = getRankedFBOsByAirport(airport.icao);
    const cheapest = rankedFBOs.find(f => f.rank === 1);
    return {
        title: `Fuel Prices at ${airport.icao} — ${airport.name}${cheapest ? ` | Jet-A from $${cheapest.fuelPrices.jetA.toFixed(2)}` : ''}`,
        description: `Compare fuel prices at ${rankedFBOs.length} FBOs at ${airport.name} (${airport.icao}) in ${airport.city}, ${airport.state}. Find the cheapest Jet-A and 100LL.`,
    };
}

export default async function AirportPage({ params }) {
    const { icao } = await params;
    const airport = getAirportByCode(icao);
    if (!airport) return <div className="container page-content"><h1>Airport not found</h1></div>;

    const rankedFBOs = getRankedFBOsByAirport(airport.icao);
    const stateData = states.find(s => s.name === airport.state);
    const priceStats = getPriceStats(rankedFBOs);

    return (
        <div className="page-content">
            <div className="container">
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: airport.state, href: stateData ? `/state/${stateData.slug}/` : '/states/' },
                    { label: airport.icao },
                ]} />

                <div className="detail-header">
                    <div className="detail-icon">✈️</div>
                    <div className="detail-header-text">
                        <h1>{airport.icao}</h1>
                        <div className="detail-header-subtitle">{airport.name}</div>
                        <div className="tags" style={{ marginTop: '8px' }}>
                            <span className="tag">{airport.city}, {airport.state}</span>
                            {priceStats.cheapest && <span className="tag tag--fuel">Jet-A from ${priceStats.cheapest.toFixed(2)}</span>}
                        </div>
                    </div>
                </div>

                <PriceStatsBar stats={priceStats} />

                <div style={{ marginTop: 'var(--space-xl)' }}>
                    <div className="section-header" style={{ marginBottom: 'var(--space-md)' }}>
                        <h2>Fuel Price Leaderboard</h2>
                        <span className="result-count">{rankedFBOs.length} {rankedFBOs.length === 1 ? 'FBO' : 'FBOs'} at {airport.icao}</span>
                    </div>

                    {rankedFBOs.length > 0 ? (
                        <LeaderboardTable fbos={rankedFBOs} showState={false} showAirport={false} />
                    ) : (
                        <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                            No FBOs listed at this airport yet. <a href="mailto:prices@fboairport.com" style={{ color: 'var(--color-accent)' }}>Submit a listing</a>.
                        </div>
                    )}
                </div>

                <div className="claim-banner">
                    <div>
                        <h3>Know the current price at {airport.icao}?</h3>
                        <p>Help pilots save money by reporting fuel prices.</p>
                    </div>
                    <a href="mailto:prices@fboairport.com" className="btn">Report a Price</a>
                </div>
            </div>
        </div>
    );
}
