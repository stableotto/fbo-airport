import Link from 'next/link';

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

            <div className="fuel-price-updated">
                Prices last updated: {fbo.priceUpdated || 'Unknown'} · Prices may vary
            </div>

            {/* Report a price CTA */}
            <div className="report-price-banner">
                <p>Know the current fuel price? Help fellow pilots with accurate data.</p>
                <Link href={`/contact/?topic=price&ref=${fbo.slug}`} className="btn btn-outline">Report a Price</Link>
            </div>
        </div>
    );
}
