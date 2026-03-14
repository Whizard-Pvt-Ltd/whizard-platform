# Dockerfile for Angular Admin Portal
# Multi-stage build for optimal size with Nginx serving

# ============================================
# Stage 1: Base Dependencies
# ============================================
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.6.0 --activate

WORKDIR /app

# ============================================
# Stage 2: Dependencies Installation
# ============================================
FROM base AS deps

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy app-specific package.json
COPY apps/web/admin-portal/package.json ./apps/web/admin-portal/

# Copy prisma schema (needed for postinstall script)
COPY prisma ./prisma

# Install dependencies (including Angular build tools)
# Note: NOT using --ignore-scripts because Angular needs proper linking
RUN pnpm install --frozen-lockfile --prefer-offline

# ============================================
# Stage 3: Build Angular App
# ============================================
FROM deps AS builder

# Accept build arguments for environment variables
ARG VITE_BFF_API_URL=https://bfftest.whizard.club
ARG VITE_STACK_AUTH_PROJECT_ID
ARG VITE_STACK_AUTH_PUBLISHABLE_CLIENT_KEY

# Set as environment variables for Vite build
ENV VITE_BFF_API_URL=${VITE_BFF_API_URL}
ENV VITE_STACK_AUTH_PROJECT_ID=${VITE_STACK_AUTH_PROJECT_ID}
ENV VITE_STACK_AUTH_PUBLISHABLE_CLIENT_KEY=${VITE_STACK_AUTH_PUBLISHABLE_CLIENT_KEY}

# Copy source code
COPY . .

# Build admin portal for production
RUN pnpm build:web-admin

# ============================================
# Stage 4: Production Runtime with Nginx
# ============================================
FROM nginx:alpine AS runtime

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY apps/web/admin-portal/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app from builder
# Note: Angular 19+ outputs to a 'browser' subdirectory
COPY --from=builder /app/dist/apps/web/admin-portal/browser /usr/share/nginx/html

# Create non-root user for nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
