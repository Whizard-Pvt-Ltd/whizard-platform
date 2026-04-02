# Dockerfile for BFF API Service
# Multi-stage build with production-only dependencies
# BFF is now a thin HTTP gateway - no database access needed

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
COPY apps/api/bff/package.json ./apps/api/bff/

# Install ALL dependencies (needed for build)
# Use --ignore-scripts because BFF doesn't need Prisma (the workspace postinstall runs prisma generate)
RUN pnpm install --frozen-lockfile --prefer-offline --ignore-scripts

# ============================================
# Stage 3: Build (with all deps including dev)
# ============================================
FROM --platform=$TARGETPLATFORM deps AS builder

# Copy source code
COPY . .

# Build only BFF runtime workspace libs (no DB/Prisma dependency chain)
RUN pnpm nx run @whizard/shared-logging:build --skip-nx-cache && \
    pnpm nx run shared-kernel:build --skip-nx-cache && \
    pnpm nx run core-api-client:build --skip-nx-cache

# Build only the BFF target in Docker.
# Avoid transitive Nx task dependencies that can pull DB/Prisma-related libs.
RUN pnpm nx build bff --skip-nx-cache --excludeTaskDependencies --verbose

# ============================================
# Stage 4: Deploy (Create pruned production package)
# ============================================
FROM --platform=$TARGETPLATFORM builder AS deployer

# Use pnpm deploy to create a standalone production bundle
# This creates a clean copy with ONLY production dependencies
# force-legacy-deploy is enabled in .npmrc for pnpm v10 compatibility
# BFF doesn't need Prisma, so skip postinstall scripts (which run prisma generate)
RUN pnpm deploy --filter=@whizard/bff --prod --ignore-scripts /prod/bff

# Copy bundled output to deploy directory (from app-specific dist folder)
WORKDIR /prod/bff
RUN cp -r /app/apps/api/bff/dist ./

# Copy docker entrypoint script
COPY apps/api/bff/docker-entrypoint.sh /prod/bff/docker-entrypoint.sh
RUN chmod +x /prod/bff/docker-entrypoint.sh

# Note: BFF is now a thin HTTP proxy
# Only runtime dependencies (Fastify, HTTP client, etc.) are needed from node_modules

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
COPY --from=deployer --chown=nodejs:nodejs /prod/bff ./

# Switch to non-root user
USER nodejs

# Expose BFF port
EXPOSE 3000

# Environment variable for port
ENV PORT=3000
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start server
CMD ["sh", "docker-entrypoint.sh"]
