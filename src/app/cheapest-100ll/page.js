import Link from 'next/link';
import { getStatesWithPrices, getAllFBOs } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
    title: 'Cheapest 100LL Avgas by State — Compare Aviation Fuel Prices',
    description: 'Find the cheapest 100LL avgas prices in every US state. Compare FBO fuel prices and save money on aviation fuel nationwide.',
};

export default function Cheapest100LLIndexPage() {
    const allFBOs = getAllFBOs();

    // Calculate cheapest 100LL per state
    const stateData = {};
    allFBOs.forEach(fbo => {
        if (!fbo.fuelPrices?.hundredLL) return;
        const state = fbo.state;
        if (!stateData[state]) {
            stateData[state] = { cheapest: fbo.fuelPrices.hundredLL, count: 1 };
        } else {
            stateData[state].count++;
            if (fbo.fuelPrices.hundredLL < stateData[state].cheapest) {
                stateData[state].cheapest = fbo.fuelPrices.hundredLL;
            }
        }
    });

    const statesWithPrices = getStatesWithPrices()
        .filter(s => stateData[s.name])
        .map(s => ({
            ...s,
            cheapest100LL: stateData[s.name]?.cheapest,
            fboCount100LL: stateData[s.name]?.count || 0,
        }))
        .sort((a, b) => a.cheapest100LL - b.cheapest100LL);

    return (
        <div className="page-content">
            <div className="container">
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: 'Cheapest 100LL by State' },
                ]} />

                <div className="hero" style={{ textAlign: 'left', padding: 'var(--space-xl) 0' }}>
                    <h1>Cheapest 100LL Avgas by State</h1>
                    <p>Find the lowest 100LL prices in every state. Click a state to see all FBOs ranked by price.</p>
                </div>

                <div className="state-grid">
                    {statesWithPrices.map(state => (
                        <Link key={state.slug} href={`/cheapest-100ll/${state.slug}/`} className="state-card">
                            <div className="state-card-price">${state.cheapest100LL.toFixed(2)}</div>
                            <div className="state-card-name">{state.name}</div>
                            <div className="state-card-count">{state.fboCount100LL} FBOs with 100LL</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
