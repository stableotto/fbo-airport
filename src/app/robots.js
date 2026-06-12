export const dynamic = 'force-static';

// AI crawlers we explicitly welcome. Being readable by these is the prerequisite for any
// exposure in ChatGPT, Perplexity, Google AI Overviews/Gemini, Claude, and similar
// answer engines — so we allow them by name (in addition to the catch-all) to make the
// intent unambiguous and guard against accidental future blocks.
const AI_BOTS = [
    'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',        // OpenAI
    'ClaudeBot', 'Claude-Web', 'anthropic-ai',         // Anthropic
    'PerplexityBot', 'Perplexity-User',                // Perplexity
    'Google-Extended',                                 // Google Gemini / AI Overviews
    'Applebot-Extended',                               // Apple Intelligence
    'CCBot',                                           // Common Crawl (feeds many models)
    'Amazonbot', 'Bytespider', 'Meta-ExternalAgent',   // Amazon, ByteDance, Meta
    'cohere-ai', 'Diffbot', 'omgili', 'YouBot',
];

export default function robots() {
    return {
        rules: [
            { userAgent: '*', allow: '/' },
            ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/' })),
        ],
        sitemap: 'https://fboairport.com/sitemap.xml',
        host: 'https://fboairport.com',
    };
}
