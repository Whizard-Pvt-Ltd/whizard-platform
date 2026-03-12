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
# Force rebuild in Docker to avoid cache issues
RUN echo "=== DEBUG: Current working directory before build ===" && \
    pwd && \
    echo "=== DEBUG: Checking if dist exists before build ===" && \
    ls -la /app/apps/api/bff/ && \
    pnpm nx build bff --skip-nx-cache && \
    echo "=== DEBUG: Build completed, checking immediately ===" && \
    ls -la /app/apps/api/bff/dist/ || echo "dist not created!"

# DEBUG: Check what was built - look in multiple possible locations
RUN echo "=== DEBUG: Contents of /app/apps/api/bff/dist after build ===" && \
    ls -la /app/apps/api/bff/dist/ && \
    echo "=== DEBUG: Check workspace root dist ===" && \
    ls -la /app/dist/apps/api/bff/ 2>/dev/null || echo "Not in /app/dist/" && \
    echo "=== DEBUG: Find all server.js files ===" && \
    find /app -name "server.js" -type f 2>/dev/null || echo "No server.js found"

# ============================================
# Stage 4: Deploy (Create pruned production package)
# ============================================
FROM builder AS deployer

# Use pnpm deploy to create a standalone production bundle
# This creates a clean copy with ONLY production dependencies
# force-legacy-deploy is enabled in .npmrc for pnpm v10 compatibility
RUN pnpm deploy --filter=@whizard/bff --prod /prod/bff

# DEBUG: Check what pnpm deploy created AND if source dist still exists
RUN echo "=== DEBUG: Contents of /prod/bff after pnpm deploy ===" && \
    ls -la /prod/bff/ && \
    echo "=== DEBUG: Contents of /prod/bff/dist (if exists) ===" && \
    ls -la /prod/bff/dist/ || echo "dist folder does not exist" && \
    echo "=== DEBUG: Check if /app/apps/api/bff/dist still exists after pnpm deploy ===" && \
    ls -la /app/apps/api/bff/dist/ || echo "/app/apps/api/bff/dist does not exist anymore!"

# Copy Prisma schema to production directory (needed for client generation)
RUN cp -r /app/prisma /prod/bff/

# Switch to production directory and generate Prisma client using npx
# This generates the client in the production node_modules without modifying package.json
WORKDIR /prod/bff
RUN npx prisma@6.19.2 generate

# DEBUG: Check build artifacts before copying
RUN echo "=== DEBUG: Contents of /app/apps/api/bff/dist before copy ===" && \
    ls -la /app/apps/api/bff/dist/

# Copy bundled output to deploy directory (from app-specific dist folder)
RUN cp -r /app/apps/api/bff/dist /prod/bff/

# DEBUG: Check what was copied
RUN echo "=== DEBUG: Contents of /prod/bff after dist copy ===" && \
    ls -la /prod/bff/ && \
    echo "=== DEBUG: Contents of /prod/bff/dist after copy ===" && \
    ls -la /prod/bff/dist/

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
