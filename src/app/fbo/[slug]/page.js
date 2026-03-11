import { getAllFBOs, getFBOBySlug, getAirportByCode } from '@/lib/data';
import { states } from '@/data/seed';
import Breadcrumbs from '@/components/Breadcrumbs';
import InfoSidebar from '@/components/InfoSidebar';
import FuelPriceSection from '@/components/FuelPriceSection';

export function generateStaticParams() {
    return getAllFBOs().map(f => ({ slug: f.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const fbo = getFBOBySlug(slug);
    if (!fbo) return {};
    return {
        title: `${fbo.name} — FBO at ${fbo.airportCode} in ${fbo.city}, ${fbo.state}`,
        description: `${fbo.name} is a Fixed Base Operator at ${fbo.airportCode} in ${fbo.city}, ${fbo.state}. Services include ${fbo.services.slice(0, 4).join(', ')}. Fuel: ${fbo.fuelTypes.join(', ')}.`,
    };
}

function FBOJsonLd({ fbo, airport }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: fbo.name,
        description: fbo.description,
        address: {
            '@type': 'PostalAddress',
            addressLocality: fbo.city,
            addressRegion: fbo.state,
            addressCountry: 'US',
        },
        telephone: fbo.phone,
        url: fbo.website || `https://fboairport.com/fbo/${fbo.slug}/`,
        ...(airport ? { geo: { '@type': 'GeoCoordinates', latitude: airport.lat, longitude: airport.lng } } : {}),
    };
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default async function FBOPage({ params }) {
    const { slug } = await params;
    const fbo = getFBOBySlug(slug);
    if (!fbo) return <div className="container page-content"><h1>FBO not found</h1></div>;

    const airport = getAirportByCode(fbo.airportCode);
    const stateData = states.find(s => s.name === fbo.state);
    const initials = fbo.name.split(' ').map(w => w[0]).join('').slice(0, 2);

    return (
        <div className="page-content">
            <FBOJsonLd fbo={fbo} airport={airport} />
            <div className="container">
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: fbo.state, href: stateData ? `/state/${stateData.slug}/` : '/states/' },
                    { label: fbo.airportCode, href: `/airport/${fbo.airportCode}/` },
                    { label: fbo.name },
                ]} />

                <div className="detail-layout">
                    <div>
                        <div className="detail-header">
                            <div className="detail-icon">{initials}</div>
                            <div className="detail-header-text">
                                <h1>{fbo.name}</h1>
                                <div className="detail-header-subtitle">{airport ? airport.name : fbo.airportCode}</div>
                                <div className="tags" style={{ marginTop: '8px' }}>
                                    <span className="tag tag--accent">{fbo.airportCode}</span>
                                    {fbo.fuelTypes.map(f => <span key={f} className="tag tag--fuel">{f}</span>)}
                                    <span className="tag">{fbo.city}, {fbo.state}</span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-nav">
                            <a className="active">Overview</a>
                            <a>Services</a>
                            {fbo.website && (
                                <a href={fbo.website} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', color: 'var(--color-accent)' }}>
                                    🔗 {fbo.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                </a>
                            )}
                        </div>

                        <div className="detail-section">
                            <h2>About {fbo.name}</h2>
                            <p>{fbo.description}</p>
                        </div>

                        <FuelPriceSection fbo={fbo} />

                        <div className="detail-section">
                            <h2>Services</h2>
                            <div className="services-grid">
                                {fbo.services.map(s => (
                                    <div key={s} className="service-item">
                                        <span className="service-check">✓</span>
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="detail-section">
                            <h2>Contact Information</h2>
                            <div className="services-grid">
                                {fbo.phone && (
                                    <div className="service-item">
                                        <span>📞</span>
                                        <a href={`tel:${fbo.phone}`}>{fbo.phone}</a>
                                    </div>
                                )}
                                {fbo.website && (
                                    <div className="service-item">
                                        <span>🌐</span>
                                        <a href={fbo.website} target="_blank" rel="noopener noreferrer">{fbo.website.replace(/^https?:\/\//, '')}</a>
                                    </div>
                                )}
                                <div className="service-item">
                                    <span>🕐</span>
                                    Hours: {fbo.hours}
                                </div>
                            </div>
                        </div>

                        <div className="claim-banner">
                            <div>
                                <h3>Is this your FBO?</h3>
                                <p>Claim this listing to update your information, add photos, and respond to reviews.</p>
                            </div>
                            <a href="mailto:listings@fboairport.com" className="btn">Claim This Listing</a>
                        </div>
                    </div>

                    <InfoSidebar fbo={fbo} airport={airport} />
                </div>
            </div>
        </div>
    );
}
