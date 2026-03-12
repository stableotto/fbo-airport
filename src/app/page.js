import Link from 'next/link';
import { getStats, getAllFBOs, getAllAirports, getRankedFBOs, getPriceStats, getStatesWithPrices } from '@/lib/data';
import SearchBar from '@/components/SearchBar';
import LeaderboardTable from '@/components/LeaderboardTable';

export default function HomePage() {
  const stats = getStats();
  const allFBOs = getAllFBOs();
  const allAirports = getAllAirports();
  const rankedFBOs = getRankedFBOs();
  const priceStats = getPriceStats(allFBOs);
  const statesWithPrices = getStatesWithPrices();

  return (
    <div className="page-content">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>Compare Aviation Fuel Prices</h1>
          <p>
            Real-time fuel price rankings at {stats.totalFBOs} FBOs across {stats.totalStates} states.
            Find the cheapest Jet-A and 100LL near you.
          </p>
          <SearchBar fbos={allFBOs} airports={allAirports} />
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">${priceStats.cheapest?.toFixed(2)}</span>
              <span className="hero-stat-label">Cheapest Jet-A</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">${priceStats.average?.toFixed(2)}</span>
              <span className="hero-stat-label">National Average</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">{stats.totalFBOs}</span>
              <span className="hero-stat-label">FBOs Tracked</span>
            </div>
          </div>
        </div>
      </section>

      {/* Compare by State */}
      <section className="container" style={{ marginBottom: 'var(--space-3xl)' }}>
        <div className="section-header">
          <h2>Compare Prices by State</h2>
          <Link href="/states/" className="btn btn-outline">View All States →</Link>
        </div>
        <div className="state-grid">
          {statesWithPrices.filter(s => s.cheapestJetA).slice(0, 12).map(state => (
            <Link key={state.slug} href={`/state/${state.slug}/`} className="state-card">
              <div className="state-card-name">{state.name}</div>
              <div className="state-card-price">
                {state.cheapestJetA ? `From $${state.cheapestJetA.toFixed(2)}` : 'No prices'}
              </div>
              <div className="state-card-count">{state.fboCount} FBOs · {state.airportCount} airports</div>
            </Link>
          ))}
        </div>
      </section>

      {/* National Fuel Price Leaderboard */}
      <section className="container" style={{ marginBottom: 'var(--space-3xl)' }}>
        <div className="section-header">
          <h2>National Fuel Price Leaderboard</h2>
          <span className="result-count">{rankedFBOs.length} FBOs ranked by Jet-A price</span>
        </div>
        <LeaderboardTable fbos={rankedFBOs} showState={true} showAirport={true} />
      </section>

      {/* CTA */}
      <section className="container">
        <div className="claim-banner">
          <div>
            <h3>Know a better fuel price?</h3>
            <p>Help pilots save money by reporting the latest fuel prices at your local FBO.</p>
          </div>
          <a href="mailto:prices@fboairport.com" className="btn">Report a Price</a>
        </div>
      </section>
    </div>
  );
}
