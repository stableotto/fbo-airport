import Link from 'next/link';
import { getAllAirports, getAllFBOs } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
    title: 'Fuel Prices by Airport — Compare Jet-A & 100LL Prices',
    description: 'Find fuel prices at airports across the United States. Compare Jet-A and 100LL prices at FBOs nationwide.',
};

export default function FuelPricesIndexPage() {
    const allAirports = getAllAirports();
    const allFBOs = getAllFBOs();

    // Get cheapest price per airport
    const airportPrices = {};
    allFBOs.forEach(fbo => {
        const code = fbo.airportCode;
        if (!airportPrices[code]) {
            airportPrices[code] = { jetA: null, fboCount: 0 };
        }
        airportPrices[code].fboCount++;
        if (fbo.fuelPrices?.jetA) {
            if (!airportPrices[code].jetA || fbo.fuelPrices.jetA < airportPrices[code].jetA) {
                airportPrices[code].jetA = fbo.fuelPrices.jetA;
            }
        }
    });

    const airportsWithPrices = allAirports
        .filter(a => airportPrices[a.icao]?.jetA)
        .map(a => ({
            ...a,
            cheapestJetA: airportPrices[a.icao].jetA,
            fboCount: airportPrices[a.icao].fboCount,
        }))
        .sort((a, b) => a.cheapestJetA - b.cheapestJetA);

    return (
        <div className="page-content">
            <div className="container">
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: 'Fuel Prices by Airport' },
                ]} />

                <div className="hero" style={{ textAlign: 'left', padding: 'var(--space-xl) 0' }}>
                    <h1>Fuel Prices by Airport</h1>
                    <p>Compare Jet-A and 100LL prices at {airportsWithPrices.length} airports. Click an airport to see all FBO prices.</p>
                </div>

                <div className="listing-container">
                    {airportsWithPrices.slice(0, 100).map(airport => (
                        <Link key={airport.icao} href={`/fuel-prices/${airport.icao}/`} className="card-row">
                            <div className="card-icon">{airport.icao.slice(1, 3)}</div>
                            <div className="card-content">
                                <div className="card-title">{airport.icao} — {airport.name}</div>
                                <div className="card-subtitle">{airport.city}, {airport.state} · {airport.fboCount} FBOs</div>
                            </div>
                            <div className="card-price">
                                <span className="card-price-value">${airport.cheapestJetA.toFixed(2)}</span>
                                <span className="card-price-label">Jet-A</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {airportsWithPrices.length > 100 && (
                    <p style={{ marginTop: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        Showing top 100 airports by price. Use search to find a specific airport.
                    </p>
                )}
            </div>
        </div>
    );
}
