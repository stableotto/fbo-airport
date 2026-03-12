import Link from 'next/link';
import { getStatesWithPrices } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
    title: 'Cheapest Jet-A Fuel by State — Compare Aviation Fuel Prices',
    description: 'Find the cheapest Jet-A fuel prices in every US state. Compare FBO fuel prices and save money on aviation fuel nationwide.',
};

export default function CheapestJetAIndexPage() {
    const statesWithPrices = getStatesWithPrices()
        .filter(s => s.cheapestJetA)
        .sort((a, b) => a.cheapestJetA - b.cheapestJetA);

    return (
        <div className="page-content">
            <div className="container">
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: 'Cheapest Jet-A by State' },
                ]} />

                <div className="hero" style={{ textAlign: 'left', padding: 'var(--space-xl) 0' }}>
                    <h1>Cheapest Jet-A Fuel by State</h1>
                    <p>Find the lowest Jet-A prices in every state. Click a state to see all FBOs ranked by price.</p>
                </div>

                <div className="state-grid">
                    {statesWithPrices.map(state => (
                        <Link key={state.slug} href={`/cheapest-jet-a/${state.slug}/`} className="state-card">
                            <div className="state-card-price">${state.cheapestJetA.toFixed(2)}</div>
                            <div className="state-card-name">{state.name}</div>
                            <div className="state-card-count">{state.fboCount} FBOs with pricing</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
