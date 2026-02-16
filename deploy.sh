#!/bin/bash
set -e

echo "=== Building ecosystem index ==="
python3 ~/build-ecosystem-index.py

echo "=== Applying privacy filter ==="
python3 ~/privacy-filter.py
python3 ~/privacy-filter.py --validate

echo "=== Copying filtered data ==="
cp ~/ecosystem-index-public.json ~/ecosystem-dashboard/public/data/ecosystem-index.json

echo "=== Building dashboard ==="
cd ~/ecosystem-dashboard
npx pnpm build

echo "=== Committing data update ==="
git add public/data/ecosystem-index.json
git commit -m "Update ecosystem data $(date +%Y-%m-%d)" || echo "No data changes to commit"

echo "=== Pushing ==="
git push

echo "=== Done ==="
