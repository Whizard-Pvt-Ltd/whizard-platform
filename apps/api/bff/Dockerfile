# Dockerfile for BFF API Service
# Multi-stage build with production-only dependencies

# ============================================
# Stage 1: Base Dependencies
# ============================================
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.6.0 --activate

WORKDIR /app

# ============================================
# Stage 2: Dependencies Installation (All deps for build)
# ============================================
FROM base AS deps

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY .npmrc ./

# Copy app-specific package.json
COPY apps/api/bff/package.json ./apps/api/bff/

# Install ALL dependencies (needed for build)
# --ignore-scripts because prisma schema not copied yet
RUN pnpm install --frozen-lockfile --prefer-offline --ignore-scripts

# ============================================
# Stage 3: Build (with all deps including dev)
# ============================================
FROM deps AS builder

# Copy source code
COPY . .

# Generate Prisma Client (needs prisma CLI from devDependencies)
# Must run from workspace root where schema.prisma is located
RUN pnpm prisma generate

# Build with NX (builds libs first with TypeScript, then app with Vite)
# NX will use caching to skip unchanged libraries
RUN pnpm nx build bff

# ============================================
# Stage 4: Deploy (Create pruned production package)
# ============================================
FROM builder AS deployer

# Use pnpm deploy to create a standalone production bundle
# This creates a clean copy with ONLY production dependencies
# force-legacy-deploy is enabled in .npmrc for pnpm v10 compatibility
RUN pnpm deploy --filter=@whizard/bff --prod /prod/bff

# Copy Prisma schema to production directory (needed for client generation)
RUN cp -r /app/prisma /prod/bff/

# Switch to production directory and generate Prisma client using npx
# This generates the client in the production node_modules without modifying package.json
WORKDIR /prod/bff
RUN npx prisma@6.19.2 generate

# Copy bundled output to deploy directory (from app-specific dist folder)
RUN cp -r /app/apps/api/bff/dist /prod/bff/

# Copy docker entrypoint script
COPY apps/api/bff/docker-entrypoint.sh /prod/bff/docker-entrypoint.sh
RUN chmod +x /prod/bff/docker-entrypoint.sh

# Note: Libs are bundled into the server.js file by Vite
# Only runtime dependencies (Prisma, Fastify, etc.) are needed from node_modules

# ============================================
# Stage 5: Production Runtime (Optimized)
# ============================================
FROM node:22-alpine AS runtime

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
