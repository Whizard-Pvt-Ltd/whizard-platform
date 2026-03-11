#!/bin/sh
set -e

# Note: Prisma migrations should be run separately before container startup
# Run: docker compose run --rm core-api sh -c "pnpm prisma migrate deploy"
# Or: pnpm prisma migrate deploy (from host)

echo "Starting Core API server..."
exec node dist/server.js
