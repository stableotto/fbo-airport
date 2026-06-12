import Link from 'next/link';
import { getAllFBOs, getFBOBySlug, getAirportByCode, isThinFBO } from '@/lib/data';
import { states } from '@/data/seed';
import Breadcrumbs from '@/components/Breadcrumbs';
import InfoSidebar from '@/components/InfoSidebar';
import FuelPriceSection from '@/components/FuelPriceSection';
import RelatedLinks from '@/components/RelatedLinks';
import JsonLd from '@/components/JsonLd';
import { breadcrumbList, fboSchema } from '@/lib/structured-data';

export function generateStaticParams() {
    return getAllFBOs().map(f => ({ slug: f.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const fbo = getFBOBySlug(slug);
    if (!fbo) return {};
    const title = `${fbo.name} — FBO at ${fbo.airportCode} in ${fbo.city}, ${fbo.state}`;
    const description = `${fbo.name} is a Fixed Base Operator at ${fbo.airportCode} in ${fbo.city}, ${fbo.state}. Services include ${fbo.services.slice(0, 4).join(', ')}. Fuel: ${fbo.fuelTypes.join(', ')}.`;
    return {
        title,
        description,
        alternates: { canonical: `/fbo/${fbo.slug}/` },
        openGraph: { title, description, url: `/fbo/${fbo.slug}/`, type: 'website' },
        // FBOs scraped with no pricing of any kind are thin stubs (just a name). Keep them
        // crawlable for link discovery but out of the index until they have real data.
        ...(isThinFBO(fbo) ? { robots: { index: false, follow: true } } : {}),
    };
}

export default async function FBOPage({ params }) {
    const { slug } = await params;
    const fbo = getFBOBySlug(slug);
    if (!fbo) return <div className="container page-content"><h1>FBO not found</h1></div>;

    const airport = getAirportByCode(fbo.airportCode);
    const stateData = states.find(s => s.name === fbo.state);
    const initials = fbo.name.split(' ').map(w => w[0]).join('').slice(0, 2);

    const crumbs = [
        { label: 'Home', href: '/' },
        { label: fbo.state, href: stateData ? `/state/${stateData.slug}/` : '/states/' },
        { label: fbo.airportCode, href: `/airport/${fbo.airportCode}/` },
        { label: fbo.name },
    ];

    return (
        <div className="page-content">
            <JsonLd data={[breadcrumbList(crumbs), fboSchema(fbo, airport)]} />
            <div className="container">
                <Breadcrumbs items={crumbs} />

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
                                    {fbo.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
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

                        {(fbo.phone || fbo.website || fbo.hours) && (
                            <div className="detail-section">
                                <h2>Contact Information</h2>
                                <div className="services-grid">
                                    {fbo.phone && (
                                        <div className="service-item">
                                            <span className="contact-label">Phone</span>
                                            <a href={`tel:${fbo.phone}`}>{fbo.phone}</a>
                                        </div>
                                    )}
                                    {fbo.website && (
                                        <div className="service-item">
                                            <span className="contact-label">Website</span>
                                            <a href={fbo.website} target="_blank" rel="noopener noreferrer">{fbo.website.replace(/^https?:\/\//, '')}</a>
                                        </div>
                                    )}
                                    {fbo.hours && (
                                        <div className="service-item">
                                            <span className="contact-label">Hours</span>
                                            {fbo.hours}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <RelatedLinks
                            title="Compare Fuel Prices"
                            links={[
                                { label: 'Airport', title: `All FBOs at ${fbo.airportCode}`, href: `/airport/${fbo.airportCode}/` },
                                { label: 'Fuel Prices', title: `Fuel Prices at ${fbo.airportCode}`, href: `/fuel-prices/${fbo.airportCode}/` },
                                { label: 'State', title: `Cheapest Jet-A in ${fbo.state}`, href: `/cheapest-jet-a/${stateData?.slug || 'states'}/` },
                                { label: 'Self-Serve', title: `Self-Serve Fuel in ${fbo.state}`, href: `/self-serve-fuel/${stateData?.slug || 'states'}/` },
                            ]}
                        />

                        <div className="claim-banner" style={{ marginTop: 'var(--space-xl)' }}>
                            <div>
                                <h3>Is this your FBO?</h3>
                                <p>Claim this listing to update your information, add photos, and respond to reviews.</p>
                            </div>
                            <Link href={`/contact/?topic=listing&ref=${fbo.slug}`} className="btn">Claim This Listing</Link>
                        </div>
                    </div>

                    <InfoSidebar fbo={fbo} airport={airport} />
                </div>
            </div>
        </div>
    );
}
