import Script from 'next/script';

// Cloudflare Web Analytics — privacy-first, cookieless, no consent banner needed.
// Loads the lightweight beacon after the page is interactive so there's no
// render-blocking / perf hit. Renders nothing until a token is configured via
// NEXT_PUBLIC_CF_BEACON_TOKEN (grab it from the Cloudflare dashboard:
// Analytics & Logs → Web Analytics → add fboairport.com → copy the token).
export default function CloudflareAnalytics({ token }) {
    if (!token) return null;

    return (
        <Script
            id="cloudflare-web-analytics"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={JSON.stringify({ token })}
        />
    );
}
