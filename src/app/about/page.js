import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStats, getLastUpdated, getPriceHistoryMeta } from '@/lib/data';

export const metadata = {
    title: 'About FBO Airport — Data Sources & Methodology',
    description: 'How FBO Airport collects, verifies, and updates aviation fuel prices: data sourced from AirNav, refreshed daily, with a transparent methodology.',
    alternates: { canonical: '/about/' },
};

export default function AboutPage() {
    const stats = getStats();
    const history = getPriceHistoryMeta();
    const lastUpdated = new Date(getLastUpdated() + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    });

    return (
        <div className="page-content">
            <div className="container" style={{ maxWidth: '720px' }}>
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: 'About' },
                ]} />
                <h1 style={{ fontStyle: 'italic', marginBottom: 'var(--space-lg)' }}>About FBO Airport</h1>

                <div className="detail-section">
                    <p>FBO Airport helps pilots, aircraft owners, and flight departments find the cheapest aviation
                    fuel nationwide. We track Jet-A and 100LL prices at <strong>{stats.totalFBOs.toLocaleString()} FBOs</strong> across{' '}
                    <strong>{stats.totalAirports.toLocaleString()} airports</strong> in {stats.totalStates} states, rank them from
                    cheapest to most expensive, and chart how prices move over time.</p>
                </div>

                <div className="detail-section">
                    <h2>Where our data comes from</h2>
                    <p>Fuel prices are sourced from <a href="https://www.airnav.com/" target="_blank" rel="noopener noreferrer">AirNav</a>,
                    which aggregates FBO-reported pricing. We collect only real, attributable FBO data — we do not invent listings,
                    estimate prices, or fill gaps with placeholder figures. When an FBO has not reported a price, we show that
                    plainly rather than guessing.</p>
                </div>

                <div className="detail-section">
                    <h2>How often it updates</h2>
                    <p>An automated pipeline refreshes pricing <strong>every day</strong>. Each airport is re-checked on a rolling
                    schedule, and the latest figures are published to this site automatically. The most recent update was{' '}
                    <strong>{lastUpdated}</strong>.
                    {history?.dates > 1 && (
                        <> We also retain a price history — currently <strong>{history.dates} days</strong> of daily
                        observations — so you can see whether fuel at a given airport is trending up or down instead of
                        just today's snapshot.</>
                    )}</p>
                </div>

                <div className="detail-section">
                    <h2>How we rank prices</h2>
                    <p>For each airport and state we sort FBOs by posted Jet-A price (or 100LL on the avgas pages), cheapest
                    first. Self-serve prices are compared separately from full-service, since self-serve avoids the into-plane
                    fee and is usually cheaper. Averages and price spreads are computed from the FBOs currently reporting a
                    price — not from stale or fabricated entries.</p>
                </div>

                <div className="detail-section">
                    <h2>Accuracy & corrections</h2>
                    <p>Posted prices can change without notice and may not reflect negotiated, contract, or volume pricing.
                    Always confirm with the FBO before you fly. If you spot a price that looks wrong or out of date,{' '}
                    <Link href="/contact/?topic=price" style={{ color: 'var(--color-accent)' }}>let us know</Link> — corrections
                    from the pilot community keep the data honest.</p>
                </div>

                <div className="detail-section">
                    <h2>What is an FBO?</h2>
                    <p>A Fixed Base Operator (FBO) is a commercial business that provides aeronautical services such as fueling,
                    hangaring, tie-down and parking, aircraft maintenance, and flight instruction. FBOs are the primary gateway
                    for general aviation at airports across the country.</p>
                </div>

                <div className="detail-section">
                    <h2>For FBO owners</h2>
                    <p>If you own or manage an FBO, you can{' '}
                    <Link href="/contact/?topic=listing" style={{ color: 'var(--color-accent)' }}>claim your listing</Link>{' '}
                    to correct your information and keep your pricing accurate.</p>
                </div>
            </div>
        </div>
    );
}
