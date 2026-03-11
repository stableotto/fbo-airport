import Link from 'next/link';

export default function FBOCard({ fbo }) {
    const initials = fbo.name.split(' ').map(w => w[0]).join('').slice(0, 2);
    const jetAPrice = fbo.fuelPrices?.jetA;

    return (
        <Link href={`/fbo/${fbo.slug}/`} className="card-row">
            <div className="card-icon">{initials}</div>
            <div className="card-content">
                <div className="card-title">{fbo.name}</div>
                <div className="card-subtitle">{fbo.city}, {fbo.state} &middot; {fbo.airportCode}</div>
                <div className="tags">
                    <span className="tag tag--accent">{fbo.airportCode}</span>
                    {fbo.fuelTypes.map(f => (
                        <span key={f} className="tag tag--fuel">{f}</span>
                    ))}
                    {fbo.rampFee === 0 && <span className="tag" style={{ background: '#E8F5E9', color: '#2D6A2E' }}>No Ramp Fee</span>}
                    {fbo.services.includes('Crew Car') && <span className="tag tag--service">Crew Car</span>}
                    {fbo.hours === '24/7' && <span className="tag tag--service">24/7</span>}
                </div>
            </div>
            {jetAPrice && (
                <div className="card-price">
                    <div>
                        <div className="card-price-value">${jetAPrice.toFixed(2)}</div>
                        <div className="card-price-label">Jet-A /gal</div>
                    </div>
                </div>
            )}
        </Link>
    );
}
