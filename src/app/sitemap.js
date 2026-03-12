import { getAllStates, getAllAirports, getAllFBOs } from '@/lib/data';

export const dynamic = 'force-static';

export default function sitemap() {
    const baseUrl = 'https://fboairport.com';

    const staticPages = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
        { url: `${baseUrl}/states/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/cheapest-jet-a/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/about/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ];

    const statePages = getAllStates().map(s => ({
        url: `${baseUrl}/state/${s.slug}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const cheapestJetAPages = getAllStates().map(s => ({
        url: `${baseUrl}/cheapest-jet-a/${s.slug}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const airportPages = getAllAirports().map(a => ({
        url: `${baseUrl}/airport/${a.icao}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    const fboPages = getAllFBOs().map(f => ({
        url: `${baseUrl}/fbo/${f.slug}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
    }));

    return [...staticPages, ...statePages, ...cheapestJetAPages, ...airportPages, ...fboPages];
}
