// Schema.org JSON-LD builders for rich snippets.
// Keep these pure (no JSX) so they can be reused across server components.
// Every URL must be absolute for structured data to validate.

const SITE = 'https://fboairport.com';

export function absUrl(path) {
    if (!path) return SITE;
    if (path.startsWith('http')) return path;
    return SITE + (path.startsWith('/') ? path : `/${path}`);
}

// BreadcrumbList — drives breadcrumb rich results. Mirror the visual <Breadcrumbs>.
export function breadcrumbList(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: it.label,
            ...(it.href ? { item: absUrl(it.href) } : {}),
        })),
    };
}

// ItemList — a ranked list of FBOs linking to their detail pages.
export function fboItemList({ name, description, url, fbos }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name,
        ...(description ? { description } : {}),
        url: absUrl(url),
        numberOfItems: fbos.length,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: fbos.slice(0, 50).map((f, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: f.name,
            url: absUrl(`/fbo/${f.slug}/`),
        })),
    };
}

// Build AggregateOffer Product entries for the fuel sold at a location.
// Returns one Product per fuel type that has at least one price.
export function fuelProducts({ contextName, url, fbos }) {
    const products = [];
    const fuels = [
        { key: 'jetA', label: 'Jet-A Fuel' },
        { key: 'hundredLL', label: '100LL Avgas' },
    ];

    for (const fuel of fuels) {
        const prices = fbos
            .map(f => f.fuelPrices?.[fuel.key])
            .filter(p => typeof p === 'number' && p > 0);
        if (prices.length === 0) continue;

        products.push({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `${fuel.label} at ${contextName}`,
            category: 'Aviation Fuel',
            offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'USD',
                lowPrice: Math.min(...prices).toFixed(2),
                highPrice: Math.max(...prices).toFixed(2),
                offerCount: prices.length,
                availability: 'https://schema.org/InStock',
                url: absUrl(url),
            },
        });
    }
    return products;
}

// Airport schema — identifies the airport as a place.
export function airportSchema(airport) {
    const hasGeo = airport.lat && airport.lng;
    return {
        '@context': 'https://schema.org',
        '@type': 'Airport',
        name: airport.name,
        iataCode: airport.icao,
        url: absUrl(`/airport/${airport.icao}/`),
        ...(airport.city || airport.state
            ? {
                  address: {
                      '@type': 'PostalAddress',
                      addressLocality: airport.city || undefined,
                      addressRegion: airport.state || undefined,
                      addressCountry: 'US',
                  },
              }
            : {}),
        ...(hasGeo
            ? { geo: { '@type': 'GeoCoordinates', latitude: airport.lat, longitude: airport.lng } }
            : {}),
    };
}

// LocalBusiness schema for an individual FBO, including its current fuel offers.
export function fboSchema(fbo, airport) {
    const hasGeo = airport && airport.lat && airport.lng;
    const offers = [];
    const offerDefs = [
        { price: fbo.fuelPrices?.jetA, name: 'Jet-A Fuel' },
        { price: fbo.fuelPrices?.jetASelfServe, name: 'Jet-A Fuel (Self-Serve)' },
        { price: fbo.fuelPrices?.hundredLL, name: '100LL Avgas' },
        { price: fbo.fuelPrices?.hundredLLSelfServe, name: '100LL Avgas (Self-Serve)' },
    ];
    for (const def of offerDefs) {
        if (typeof def.price === 'number' && def.price > 0) {
            offers.push({
                '@type': 'Offer',
                itemOffered: { '@type': 'Product', name: def.name, category: 'Aviation Fuel' },
                price: def.price.toFixed(2),
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
            });
        }
    }

    const prices = offers.map(o => parseFloat(o.price));

    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: fbo.name,
        description: fbo.description,
        address: {
            '@type': 'PostalAddress',
            addressLocality: fbo.city || undefined,
            addressRegion: fbo.state || undefined,
            addressCountry: 'US',
        },
        ...(fbo.phone ? { telephone: fbo.phone } : {}),
        url: fbo.website || absUrl(`/fbo/${fbo.slug}/`),
        ...(hasGeo
            ? { geo: { '@type': 'GeoCoordinates', latitude: airport.lat, longitude: airport.lng } }
            : {}),
        ...(prices.length
            ? {
                  priceRange:
                      prices.length > 1
                          ? `$${Math.min(...prices).toFixed(2)}–$${Math.max(...prices).toFixed(2)}/gal`
                          : `$${prices[0].toFixed(2)}/gal`,
              }
            : {}),
        ...(offers.length ? { makesOffer: offers } : {}),
    };
}
