# Dockerfile for Core API Service
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
COPY apps/api/core-api/package.json ./apps/api/core-api/

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
# Force rebuild in Docker to avoid cache issues
RUN pnpm nx build core-api --skip-nx-cache

# ============================================
# Stage 4: Deploy (Prepare production package)
# ============================================
FROM base AS deployer

# Copy only production dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY .npmrc ./
COPY apps/api/core-api/package.json ./apps/api/core-api/

# Install ONLY production dependencies
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN pnpm prisma generate

# Copy the built dist folder from builder stage
COPY --from=builder /app/apps/api/core-api/dist ./apps/api/core-api/dist

# Copy docker entrypoint script
COPY apps/api/core-api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

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

# Copy the entire production bundle from deployer
COPY --from=deployer --chown=nodejs:nodejs /app ./

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
