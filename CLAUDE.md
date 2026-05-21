# FBO Airport — Project Instructions

## What this is
A live production website (fbo-airport.pages.dev) showing aviation fuel prices at FBOs nationwide. Static Next.js 16 site deployed to Cloudflare Pages. Data scraped daily from AirNav.

## Golden rules
1. **This is LIVE in production.** Always `npm run build` and verify before pushing.
2. **Never change the fuel-prices.json schema** without updating `src/lib/data.js` — every page depends on it.
3. **Never delete or restructure routes** without checking the sitemap (`src/app/sitemap.js`) and internal links.
4. **The auto-update pipeline must keep working.** If you touch `scripts/auto-update.sh` or `scripts/scrape-prices.mjs`, test thoroughly.
5. **Stay under Cloudflare's 20,000 file limit.** The build removes RSC .txt files to stay under. Monitor when adding routes.

## Stack
- Next.js 16.1.6 with `output: 'export'` (fully static, no server runtime)
- React 19.2.3 with React Compiler
- Puppeteer for scraping AirNav
- Cloudflare Pages for hosting
- All styling in `src/app/globals.css` (no Tailwind, no CSS modules)

## Data flow
```
AirNav.com → scrape-prices.mjs → fuel-prices.json → data.js (merge with seed) → pages → static build → Cloudflare
```

## Daily automation
A macOS LaunchAgent (`com.fboairport.autopull`) runs `scripts/auto-update.sh`:
- Triggers at 6am daily AND on laptop login
- Scrapes 200 airports per run (batched with --resume)
- Commits + pushes price updates to git
- Builds and deploys to Cloudflare
- Logs to `/tmp/fbo-airport-pull.log`

## Critical files (read before modifying)
- `src/lib/data.js` — ALL data logic, every page imports from here
- `src/data/fuel-prices.json` — scraped price database
- `scripts/scrape-prices.mjs` — the scraper (rate limiting, resume, batch)
- `scripts/auto-update.sh` — production deploy pipeline
- `src/app/globals.css` — entire design system (1600+ lines)
- `~/Library/LaunchAgents/com.fboairport.autopull.plist` — automation trigger

## Common commands
```bash
npm run build                              # Build static site to /out
npm run dev                                # Local dev server
node scripts/scrape-prices.mjs --limit 5   # Test scraper on 5 airports
tail -20 /tmp/fbo-airport-pull.log         # Check auto-update status
wrangler pages deploy out --project-name fbo-airport --commit-dirty=true  # Manual deploy
```

## Past issues to avoid
- **Merge conflicts in fuel-prices.json** blocked auto-updates for 8 days (May 12-20, 2026). The script now self-heals, but be careful with manual edits to this file.
- **RSC .txt files** pushed past Cloudflare's 20k file limit. The build pipeline deletes them. Don't remove that step.
