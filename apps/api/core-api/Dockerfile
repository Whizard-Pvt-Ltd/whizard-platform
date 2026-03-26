# Dockerfile for Core API Service
# Multi-stage build with production-only dependencies

# ============================================
# Stage 1: Base Dependencies
# ============================================
FROM --platform=$TARGETPLATFORM node:24-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.6.0 --activate

WORKDIR /app

# ============================================
# Stage 2: Dependencies Installation (All deps for build)
# ============================================
FROM --platform=$TARGETPLATFORM base AS deps

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY .npmrc ./

# Copy app-specific package.json
COPY apps/api/core-api/package.json ./apps/api/core-api/

# Copy all library package.json files (needed for workspace dependency resolution)
COPY libs/contexts/identity-access/package.json ./libs/contexts/identity-access/
COPY libs/shared/infrastructure/package.json ./libs/shared/infrastructure/
COPY libs/shared/logging/package.json ./libs/shared/logging/
COPY libs/shared/core-api-client/package.json ./libs/shared/core-api-client/

# Install ALL dependencies (needed for build)
# --ignore-scripts because prisma schema not copied yet
RUN pnpm install --frozen-lockfile --prefer-offline --ignore-scripts

# ============================================
# Stage 3: Build (with all deps including dev)
# ============================================
FROM --platform=$TARGETPLATFORM deps AS builder

# Copy source code
COPY . .

# Generate Prisma Client (needs prisma CLI from devDependencies)
# Must run from workspace root where schema.prisma is located
RUN pnpm prisma generate

# Build with NX (builds libs first with TypeScript, then app with Vite)
# Force rebuild in Docker to avoid cache issues
RUN pnpm nx build core-api --skip-nx-cache

# ============================================
# Stage 4: Deploy (Create pruned production package)
# ============================================
FROM --platform=$TARGETPLATFORM builder AS deployer

# Use pnpm deploy to create a standalone production bundle
# This creates a clean copy with ONLY production dependencies
# force-legacy-deploy is enabled in .npmrc for pnpm v10 compatibility
RUN pnpm deploy --filter=@whizard/core-api --prod /prod/core-api

# Copy Prisma schema to production directory (needed for client generation)
RUN cp -r /app/prisma /prod/core-api/

# Switch to production directory and generate Prisma client using npx
# This generates the client in the production node_modules without modifying package.json
WORKDIR /prod/core-api
RUN npx prisma@6.19.2 generate

# Compile seed to JS so it can run in the production image without tsx/ts-node
# Runs from /app where the full workspace node_modules (including tsc) is available
RUN cd /app && node_modules/.bin/tsc \
    --module commonjs \
    --moduleResolution node \
    --esModuleInterop true \
    --skipLibCheck true \
    --target es2020 \
    --outDir /prod/core-api/prisma/seeds \
    prisma/seeds/wrcf-reference.seed.ts && \
    mv /prod/core-api/prisma/seeds/wrcf-reference.seed.js \
       /prod/core-api/prisma/seeds/wrcf-reference.seed.cjs

# Copy bundled output to deploy directory (from app-specific dist folder)
RUN cp -r /app/apps/api/core-api/dist /prod/core-api/

# Copy docker entrypoint script
COPY apps/api/core-api/docker-entrypoint.sh /prod/core-api/docker-entrypoint.sh
RUN chmod +x /prod/core-api/docker-entrypoint.sh

# Note: Libs are bundled into the server.js file by Vite
# Only runtime dependencies (Prisma, Fastify, etc.) are needed from node_modules

# ============================================
# Stage 5: Production Runtime (Optimized)
# ============================================
FROM --platform=$TARGETPLATFORM node:24-alpine AS runtime

# Install dependencies for healthcheck and signal handling
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy the entire pruned production bundle from deployer
COPY --from=deployer --chown=nodejs:nodejs /prod/core-api ./

# Switch to non-root user
USER nodejs

# Expose Core API port
EXPOSE 3001

# Environment variable for port
ENV PORT=3001
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start server
CMD ["sh", "docker-entrypoint.sh"]
