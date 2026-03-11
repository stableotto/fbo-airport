export default function InfoSidebar({ fbo, airport }) {
    const initials = fbo.name.split(' ').map(w => w[0]).join('').slice(0, 2);
    return (
        <div className="info-card">
            <div className="info-card-header">
                <div className="info-card-logo">{initials}</div>
                <div className="info-card-name">{fbo.name}</div>
            </div>

            {/* Fuel price highlight */}
            {fbo.fuelPrices?.jetA && (
                <>
                    <div className="info-card-row">
                        <span className="info-card-label">Jet-A</span>
                        <span className="info-card-value" style={{ color: 'var(--color-accent)' }}>${fbo.fuelPrices.jetA.toFixed(2)}/gal</span>
                    </div>
                    {fbo.fuelPrices.jetASelfServe && (
                        <div className="info-card-row">
                            <span className="info-card-label">Jet-A Self-Serve</span>
                            <span className="info-card-value" style={{ color: 'var(--color-success)' }}>${fbo.fuelPrices.jetASelfServe.toFixed(2)}/gal</span>
                        </div>
                    )}
                    {fbo.fuelPrices.hundredLL && (
                        <div className="info-card-row">
                            <span className="info-card-label">100LL</span>
                            <span className="info-card-value">${fbo.fuelPrices.hundredLL.toFixed(2)}/gal</span>
                        </div>
                    )}
                </>
            )}

            <div className="info-card-row">
                <span className="info-card-label">Ramp Fee</span>
                <span className={`info-card-value ${fbo.rampFee === 0 ? 'status-active' : ''}`}>
                    {fbo.rampFee === 0 ? 'Free' : `$${fbo.rampFee}`}
                </span>
            </div>
            <div className="info-card-row">
                <span className="info-card-label">Airport</span>
                <span className="info-card-value">{fbo.airportCode}</span>
            </div>
            <div className="info-card-row">
                <span className="info-card-label">City</span>
                <span className="info-card-value">{fbo.city}</span>
            </div>
            <div className="info-card-row">
                <span className="info-card-label">State</span>
                <span className="info-card-value">{fbo.state}</span>
            </div>
            <div className="info-card-row">
                <span className="info-card-label">Hours</span>
                <span className="info-card-value">{fbo.hours}</span>
            </div>
            <div className="info-card-row">
                <span className="info-card-label">Status</span>
                <span className="info-card-value status-active">● Active</span>
            </div>
            {(fbo.website || fbo.phone) && (
                <div className="info-card-links">
                    {fbo.website && (
                        <a href={fbo.website} target="_blank" rel="noopener noreferrer" className="info-card-link" title="Website">🔗</a>
                    )}
                    {fbo.phone && (
                        <a href={`tel:${fbo.phone}`} className="info-card-link" title="Phone">📞</a>
                    )}
                </div>
            )}
        </div>
    );
}
