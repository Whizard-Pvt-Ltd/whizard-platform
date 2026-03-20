#!/bin/sh
set -e

echo "Starting Core API server..."

echo "Running database migrations..."
npx prisma@6.19.2 migrate deploy

echo "Seeding reference data..."
node prisma/seeds/wrcf-reference.seed.cjs

echo "Starting server..."
exec node dist/server.js
