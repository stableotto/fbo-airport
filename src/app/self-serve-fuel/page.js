import Link from 'next/link';
import { getStatesWithPrices, getAllFBOs } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
    title: 'Self-Serve Aviation Fuel by State — Cheapest Self-Service Prices',
    description: 'Find self-serve fuel prices in every US state. Save money with self-service Jet-A and 100LL at FBOs nationwide.',
};

export default function SelfServeFuelIndexPage() {
    const allFBOs = getAllFBOs();

    // Calculate cheapest self-serve per state
    const stateData = {};
    allFBOs.forEach(fbo => {
        if (!fbo.fuelPrices?.jetASelfServe) return;
        const state = fbo.state;
        if (!stateData[state]) {
            stateData[state] = { cheapest: fbo.fuelPrices.jetASelfServe, count: 1 };
        } else {
            stateData[state].count++;
            if (fbo.fuelPrices.jetASelfServe < stateData[state].cheapest) {
                stateData[state].cheapest = fbo.fuelPrices.jetASelfServe;
            }
        }
    });

    const statesWithSelfServe = getStatesWithPrices()
        .filter(s => stateData[s.name])
        .map(s => ({
            ...s,
            cheapestSelfServe: stateData[s.name]?.cheapest,
            selfServeCount: stateData[s.name]?.count || 0,
        }))
        .sort((a, b) => a.cheapestSelfServe - b.cheapestSelfServe);

    const totalSelfServe = Object.values(stateData).reduce((sum, s) => sum + s.count, 0);

    return (
        <div className="page-content">
            <div className="container">
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: 'Self-Serve Fuel by State' },
                ]} />

                <div className="hero" style={{ textAlign: 'left', padding: 'var(--space-xl) 0' }}>
                    <h1>Self-Serve Aviation Fuel by State</h1>
                    <p>
                        Find the cheapest self-serve fuel in {statesWithSelfServe.length} states.
                        {totalSelfServe} FBOs with self-service pumps nationwide.
                    </p>
                </div>

                {statesWithSelfServe.length > 0 ? (
                    <div className="state-grid">
                        {statesWithSelfServe.map(state => (
                            <Link key={state.slug} href={`/self-serve-fuel/${state.slug}/`} className="state-card">
                                <div className="state-card-price">${state.cheapestSelfServe.toFixed(2)}</div>
                                <div className="state-card-name">{state.name}</div>
                                <div className="state-card-count">{state.selfServeCount} self-serve FBOs</div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p>No self-serve fuel data available yet.</p>
                )}

                <div style={{ marginTop: 'var(--space-2xl)', padding: 'var(--space-xl)', background: 'var(--color-bg-alt)', borderRadius: 'var(--border-radius-lg)' }}>
                    <h2>Why Self-Serve?</h2>
                    <p style={{ marginTop: 'var(--space-md)', lineHeight: '1.8' }}>
                        Self-serve fuel pumps let you save $0.30-$1.00+ per gallon compared to full-service.
                        Pump your own fuel just like at a gas station — most accept credit cards and are available 24/7.
                        Perfect for price-conscious pilots and those flying at off-hours.
                    </p>
                </div>
            </div>
        </div>
    );
}
