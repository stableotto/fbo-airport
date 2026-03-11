export default function FuelPriceSection({ fbo }) {
    if (!fbo.fuelPrices) return null;
    const { jetA, jetASelfServe, hundredLL } = fbo.fuelPrices;

    return (
        <div className="detail-section">
            <h2>Fuel Prices</h2>
            <div className="fuel-prices">
                {jetA && (
                    <div className="fuel-price-card">
                        <div className="fuel-price-label">Jet-A (Full Serve)</div>
                        <div className="fuel-price-value">${jetA.toFixed(2)}</div>
                        <div className="fuel-price-unit">per gallon</div>
                        {fbo.priceUpdated && (
                            <div className="fuel-price-updated">Updated {fbo.priceUpdated}</div>
                        )}
                    </div>
                )}
                {jetASelfServe && (
                    <div className="fuel-price-card fuel-price-card--best">
                        <div className="fuel-price-label">Jet-A (Self Serve)</div>
                        <div className="fuel-price-value">${jetASelfServe.toFixed(2)}</div>
                        <div className="fuel-price-unit">per gallon</div>
                        <span className="fuel-price-badge fuel-price-badge--best">Best Price</span>
                        {fbo.priceUpdated && (
                            <div className="fuel-price-updated">Updated {fbo.priceUpdated}</div>
                        )}
                    </div>
                )}
                {hundredLL && (
                    <div className="fuel-price-card">
                        <div className="fuel-price-label">100LL</div>
                        <div className="fuel-price-value">${hundredLL.toFixed(2)}</div>
                        <div className="fuel-price-unit">per gallon</div>
                        {fbo.priceUpdated && (
                            <div className="fuel-price-updated">Updated {fbo.priceUpdated}</div>
                        )}
                    </div>
                )}
            </div>

            {/* Ramp Fee */}
            <div className="ramp-fee-row">
                <div>
                    <span className="ramp-fee-label">Ramp / Handling Fee</span>
                    {fbo.rampFeeWaived && (
                        <div className="ramp-fee-waived">✓ {fbo.rampFeeWaived}</div>
                    )}
                </div>
                <span className={`ramp-fee-value ${fbo.rampFee === 0 ? 'ramp-fee-free' : ''}`}>
                    {fbo.rampFee === 0 ? 'Free' : `$${fbo.rampFee}`}
                </span>
            </div>

            <div className="fuel-price-updated">
                Prices last updated: {fbo.priceUpdated || 'Unknown'} · Prices may vary
            </div>

            {/* Report a price CTA */}
            <div className="report-price-banner">
                <p>Know the current fuel price? Help fellow pilots with accurate data.</p>
                <a href={`mailto:prices@fboairport.com?subject=Fuel Price Update - ${fbo.name} (${fbo.airportCode})`} className="btn btn-outline">Report a Price</a>
            </div>
        </div>
    );
}
