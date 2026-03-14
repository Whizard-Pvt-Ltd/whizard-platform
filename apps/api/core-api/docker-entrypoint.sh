#!/bin/sh
set -e

echo "Starting Core API server..."

# Run Prisma migrations on startup
# Note: In production, you may want to run migrations separately to avoid
# race conditions with multiple containers. For development/demo, this is convenient.
echo "Running database migrations..."
npx prisma@6.19.2 migrate deploy

echo "Migrations complete. Starting server..."
exec node dist/server.js
