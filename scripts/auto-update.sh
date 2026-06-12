#!/bin/bash
cd /Users/randy/Documents/FBOairport/fbo-airport

echo "$(date): Starting auto-update..."

# Abort any stuck merge/rebase state
git merge --abort 2>/dev/null
git rebase --abort 2>/dev/null

# Pull latest code
git pull origin main
if [ $? -ne 0 ]; then
    echo "$(date): Pull failed. Resetting to remote to recover..."
    git reset --hard origin/main
fi

# Scrape ~200 airports per run, cycling through all with --resume
echo "$(date): Scraping fuel prices (batch of 200)..."
node scripts/scrape-prices.mjs --resume --limit 200
echo "$(date): Scrape complete."

# Reset progress if we've reached the end so next run starts over
TOTAL=$(node -e "const d=require('./scripts/us-airports.json');console.log(d.length)" 2>/dev/null)
PROGRESS=$(node -e "try{const p=require('./scripts/.scrape-progress.json');console.log(p.lastIndex)}catch{console.log(0)}" 2>/dev/null)
if [ "$PROGRESS" -ge "$TOTAL" ] 2>/dev/null; then
    echo "$(date): Full cycle complete, resetting progress for next run."
    echo '{"lastIndex":0}' > scripts/.scrape-progress.json
fi

# Commit and push scraped data
if git diff --quiet src/data/fuel-prices.json; then
    echo "$(date): No price changes to commit."
else
    echo "$(date): Committing updated fuel prices..."
    git add src/data/fuel-prices.json scripts/.scrape-progress.json
    git commit -m "chore: update fuel prices $(date +%Y-%m-%d)"
    git push origin main
    echo "$(date): Pushed to origin."
fi

# Build and deploy
echo "$(date): Building site..."
npm run build
echo "$(date): Build complete. Removing RSC files..."
find out -type f -name "*.txt" ! -name "robots.txt" ! -name "llms.txt" -delete
echo "$(date): Deploying to Cloudflare..."
wrangler pages deploy out --project-name fbo-airport --commit-dirty=true
echo "$(date): Deploy complete."
