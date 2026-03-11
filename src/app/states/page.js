import Link from 'next/link';
import { getAllStates } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
    title: 'All States — FBO Directory by State',
    description: 'Browse Fixed Base Operators by state. Find FBOs at airports across all 50 US states.',
};

export default function StatesPage() {
    const states = getAllStates();

    return (
        <div className="page-content">
            <div className="container">
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: 'States' },
                ]} />
                <div className="section-header">
                    <h1 style={{ fontStyle: 'italic' }}>Browse FBOs by State</h1>
                </div>
                <p style={{ marginBottom: 'var(--space-xl)', maxWidth: 600 }}>
                    Find Fixed Base Operators at airports in all 50 states. Click a state to view its airports and FBOs.
                </p>
                <div className="state-grid">
                    {states.map(state => (
                        <Link key={state.slug} href={`/state/${state.slug}/`} className="state-card">
                            <div className="state-card-name">{state.name}</div>
                            <div className="state-card-count">
                                {state.fboCount} {state.fboCount === 1 ? 'FBO' : 'FBOs'} · {state.airportCount} {state.airportCount === 1 ? 'airport' : 'airports'}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
