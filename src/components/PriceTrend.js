// Renders a recorded fuel-price trend for an airport: a dependency-free inline SVG
// sparkline plus a plain-language summary. The summary is intentionally prose — it is
// unique, airport-specific content that AirNav does not publish, which is the whole
// point of surfacing our own price history.

function fmtDate(iso) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PriceTrend({ trend, fuelLabel = 'Jet-A', icao }) {
    if (!trend || trend.points.length < 2) return null;

    const W = 640;
    const H = 140;
    const PAD_X = 6;
    const PAD_Y = 16;
    const { points, min, max } = trend;

    // Pad the value domain a touch so a flat line doesn't hug the edge.
    const lo = min === max ? min - 0.5 : min;
    const hi = min === max ? max + 0.5 : max;
    const span = hi - lo;

    const x = (i) => PAD_X + (i / (points.length - 1)) * (W - PAD_X * 2);
    const y = (v) => PAD_Y + (1 - (v - lo) / span) * (H - PAD_Y * 2);

    const line = points.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
    const area = `${PAD_X},${H - PAD_Y} ${line} ${W - PAD_X},${H - PAD_Y}`;
    const lastPt = points[points.length - 1];

    const dirWord = trend.direction === 'up' ? 'risen' : trend.direction === 'down' ? 'fallen' : 'held steady';
    const dirClass = `trend-${trend.direction}`;
    const absChange = Math.abs(trend.change).toFixed(2);
    const absPct = Math.abs(trend.pct).toFixed(1);

    return (
        <section className="price-trend" aria-label={`${fuelLabel} price history at ${icao}`}>
            <div className="price-trend-head">
                <h2>{fuelLabel} Price History at {icao}</h2>
                <span className={`trend-badge ${dirClass}`}>
                    {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '▬'}{' '}
                    {trend.direction === 'flat' ? 'Flat' : `${trend.change > 0 ? '+' : '−'}$${absChange}`}
                </span>
            </div>

            <svg className="sparkline" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img"
                aria-label={`${fuelLabel} low price from ${fmtDate(trend.startDate)} to ${fmtDate(trend.endDate)}`}>
                <polygon className={`sparkline-area ${dirClass}`} points={area} />
                <polyline className={`sparkline-line ${dirClass}`} points={line} />
                <circle className={`sparkline-dot ${dirClass}`} cx={x(points.length - 1)} cy={y(lastPt.value)} r="4" />
            </svg>

            <div className="trend-axis">
                <span>{fmtDate(trend.startDate)}</span>
                <span>{fmtDate(trend.endDate)}</span>
            </div>

            <p className="trend-summary">
                Over the past {trend.days} days, the cheapest {fuelLabel} at {icao} has{' '}
                <strong>{dirWord}</strong>
                {trend.direction !== 'flat' && <> by <strong>${absChange}/gal ({absPct}%)</strong></>}, moving from
                ${trend.first.toFixed(2)} to <strong>${trend.last.toFixed(2)}</strong>. Over that window it ranged
                between <strong>${trend.min.toFixed(2)}</strong> and <strong>${trend.max.toFixed(2)}</strong>
                {trend.spread > 0 && <> — a ${trend.spread.toFixed(2)}/gal swing</>}.
            </p>
        </section>
    );
}
