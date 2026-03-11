export default function PriceStatsBar({ stats }) {
    if (!stats || stats.count === 0) return null;

    return (
        <div className="price-stats-bar">
            <div className="price-stat-card price-stat-best">
                <div className="price-stat-icon">🏆</div>
                <div className="price-stat-content">
                    <div className="price-stat-value">${stats.cheapest.toFixed(2)}</div>
                    <div className="price-stat-label">Cheapest Jet-A</div>
                </div>
            </div>
            <div className="price-stat-card">
                <div className="price-stat-icon">📊</div>
                <div className="price-stat-content">
                    <div className="price-stat-value">${stats.average.toFixed(2)}</div>
                    <div className="price-stat-label">Average Jet-A</div>
                </div>
            </div>
            <div className="price-stat-card price-stat-expensive">
                <div className="price-stat-icon">📈</div>
                <div className="price-stat-content">
                    <div className="price-stat-value">${stats.mostExpensive.toFixed(2)}</div>
                    <div className="price-stat-label">Most Expensive</div>
                </div>
            </div>
            <div className="price-stat-card">
                <div className="price-stat-icon">⛽</div>
                <div className="price-stat-content">
                    <div className="price-stat-value">{stats.count}</div>
                    <div className="price-stat-label">FBOs Reporting</div>
                </div>
            </div>
        </div>
    );
}
