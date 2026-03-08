#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo "Whizard Platform - Bootstrap"
echo "================================================"

echo ""
echo "[1/6] Checking Node.js and pnpm versions"
echo "  Node: $(node --version)"
echo "  pnpm: $(pnpm --version)"

echo ""
echo "[2/6] Installing workspace dependencies"
pnpm install --frozen-lockfile

echo ""
echo "[3/6] Verifying environment variables"
if [ -f .env ]; then
  set -a  # automatically export all variables
  source .env
  set +a
  bash tools/scripts/verify-env.sh
else
  echo "[WARN] No .env file found. Using .env.example as reference."
  echo "Please copy .env.example to .env and configure it."
fi

echo ""
echo "[4/6] Generating Prisma client"
pnpm prisma:generate

echo ""
echo "[5/6] Preparing output directories"
mkdir -p dist artifacts tmp logs

echo ""
echo "[6/6] Syncing Nx graph (optional)"
pnpm nx graph --file=tmp/nx-graph.html >/dev/null 2>&1 || echo "  (Nx graph generation skipped)"

echo ""
echo "================================================"
echo "[SUCCESS] Bootstrap complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Ensure PostgreSQL is running on port 5432"
echo "  2. Run: pnpm run db:migrate:dev"
echo "  3. Run: pnpm run dev:all"
echo ""
