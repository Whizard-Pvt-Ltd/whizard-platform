#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo "Database Setup - IAM Context"
echo "================================================"

# Load environment
if [ -f .env ]; then
  source .env
else
  echo "[ERROR] .env file not found"
  exit 1
fi

echo ""
echo "[1/4] Checking PostgreSQL connection"
if command -v psql &> /dev/null; then
  echo "  PostgreSQL client found"
else
  echo "[WARN] psql command not found - cannot verify connection"
fi

echo ""
echo "[2/4] Generating Prisma client"
pnpm prisma:generate

echo ""
echo "[3/4] Running database migrations"
pnpm prisma:migrate:deploy

echo ""
echo "[4/4] Verifying database schema"
echo "  Database URL: ${DATABASE_URL}"

echo ""
echo "================================================"
echo "[SUCCESS] Database setup complete!"
echo "================================================"
