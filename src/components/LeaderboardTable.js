'use client';
import Link from 'next/link';

export default function LeaderboardTable({ fbos, showState = false, showAirport = true }) {
    if (!fbos || fbos.length === 0) return null;

    const cheapestJetA = fbos.find(f => f.rank === 1)?.fuelPrices?.jetA;
    const cheapest100LL = fbos
        .filter(f => f.fuelPrices?.hundredLL)
        .sort((a, b) => a.fuelPrices.hundredLL - b.fuelPrices.hundredLL)[0]?.fuelPrices?.hundredLL;

    function getRankClass(rank) {
        if (rank === 1) return 'rank-badge rank-1';
        if (rank === 2) return 'rank-badge rank-2';
        if (rank === 3) return 'rank-badge rank-3';
        return 'rank-badge';
    }

    return (
        <div className="leaderboard-wrapper">
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th className="th-rank">#</th>
                        <th>FBO</th>
                        {showAirport && <th>Airport</th>}
                        {showState && <th>Location</th>}
                        <th className="th-price">Jet-A</th>
                        <th className="th-price">100LL</th>
                        <th className="th-price">Ramp Fee</th>
                    </tr>
                </thead>
                <tbody>
                    {fbos.map(fbo => (
                        <tr key={fbo.slug} className={fbo.rank && fbo.rank <= 3 ? `leaderboard-top-${fbo.rank}` : ''}>
                            <td className="td-rank">
                                {fbo.rank ? (
                                    <span className={getRankClass(fbo.rank)}>{fbo.rank}</span>
                                ) : (
                                    <span className="rank-badge rank-na">—</span>
                                )}
                            </td>
                            <td className="td-fbo">
                                <Link href={`/fbo/${fbo.slug}/`} className="leaderboard-fbo-link">
                                    <span className="leaderboard-fbo-name">{fbo.name}</span>
                                    {fbo.rank === 1 && <span className="best-price-label">Best Price</span>}
                                </Link>
                            </td>
                            {showAirport && (
                                <td className="td-airport">
                                    <Link href={`/airport/${fbo.airportCode}/`} className="leaderboard-airport-link">
                                        {fbo.airportCode}
                                    </Link>
                                </td>
                            )}
                            {showState && (
                                <td className="td-location">
                                    <span className="leaderboard-city">{fbo.city}, {fbo.state}</span>
                                </td>
                            )}
                            <td className="td-price">
                                {fbo.fuelPrices?.jetA ? (
                                    <div className="price-cell">
                                        <span className={`leaderboard-price ${fbo.fuelPrices.jetA === cheapestJetA ? 'price-cheapest' : ''}`}>
                                            ${fbo.fuelPrices.jetA.toFixed(2)}
                                        </span>
                                        {fbo.delta > 0 && (
                                            <span className="delta-pill">+${fbo.delta.toFixed(2)}</span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="leaderboard-price price-na">N/A</span>
                                )}
                            </td>
                            <td className="td-price">
                                {fbo.fuelPrices?.hundredLL ? (
                                    <span className={`leaderboard-price ${fbo.fuelPrices.hundredLL === cheapest100LL ? 'price-cheapest' : ''}`}>
                                        ${fbo.fuelPrices.hundredLL.toFixed(2)}
                                    </span>
                                ) : (
                                    <span className="leaderboard-price price-na">N/A</span>
                                )}
                            </td>
                            <td className="td-price">
                                <span className={`leaderboard-price ${fbo.rampFee === 0 ? 'price-cheapest' : ''}`}>
                                    {fbo.rampFee === 0 ? 'Free' : fbo.rampFee ? `$${fbo.rampFee}` : 'N/A'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="leaderboard-footer">
                <span>Prices may vary</span>
                <span>{fbos.filter(f => f.rank).length} FBOs with pricing</span>
            </div>
        </div>
    );
}
