# Local Development & Testing Guide

## Quick Start

### Initial Setup
```bash
# Install dependencies
pnpm install

# Setup database
docker compose up -d postgres
pnpm prisma:migrate:dev

# Start development server
pnpm dev:bff
# or
pnpm dev:core-api
```

---

## Development Workflow

### 1. Daily Development (Fastest)

**Start local development with hot reload:**
```bash
pnpm dev:bff           # Start BFF with watch mode
pnpm dev:core-api      # Start Core API with watch mode
pnpm dev:all           # Start all services together
```

**Benefits:**
- Instant hot reload on file changes
- Full debugger access
- Direct console logs
- No build overhead

**When to use:** Feature development, bug fixing, quick iterations

---

### 2. Build Testing (Before Commit)

**Build with NX (same as Docker):**
```bash
pnpm build:bff         # Build BFF only
pnpm build:core-api    # Build Core API only
pnpm build:all         # Build all projects
```

**Test the built bundle:**
```bash
pnpm start:bff         # Run built BFF server
pnpm start:core-api    # Run built Core API server
```

**Benefits:**
- Tests the exact bundle that Docker will use
- Faster than full Docker build
- Catches bundling issues early

**When to use:** Before committing, troubleshooting build issues

---

### 3. Docker Testing (Before Push)

**Build Docker images:**
```bash
pnpm docker:build              # Build with cache
pnpm docker:build:nocache      # Build without cache (slower but clean)
```

**Run services:**
```bash
pnpm docker:up         # Start DB, run migrations, start services (foreground)
pnpm docker:up:d       # Start all services in background
```

**View logs:**
```bash
pnpm docker:logs           # All services logs
pnpm docker:logs:bff       # BFF logs only
pnpm docker:logs:core-api  # Core API logs only
```

**Stop services:**
```bash
pnpm docker:down       # Stop and remove containers
```

**Benefits:**
- Production-like environment
- Tests multi-stage Docker build
- Verifies Alpine Linux compatibility

**When to use:** Before pushing, after Dockerfile changes, final validation

---

## Complete Script Reference

### Development Scripts
| Command | Description |
|---------|-------------|
| `pnpm dev:bff` | Start BFF with hot reload |
| `pnpm dev:core-api` | Start Core API with hot reload |
| `pnpm dev:all` | Start all services (script) |

### Build Scripts
| Command | Description |
|---------|-------------|
| `pnpm build:bff` | Build BFF with NX + Vite |
| `pnpm build:core-api` | Build Core API with NX + Vite |
| `pnpm build:all` | Build all projects with NX |

### Start Scripts (Built Bundles)
| Command | Description |
|---------|-------------|
| `pnpm start:bff` | Run built BFF bundle |
| `pnpm start:core-api` | Run built Core API bundle |

### Docker Scripts
| Command | Description |
|---------|-------------|
| `pnpm docker:build` | Build Docker images (cached) |
| `pnpm docker:build:nocache` | Build without cache |
| `pnpm docker:up` | Start DB + migrations + services |
| `pnpm docker:up:d` | Start all in background |
| `pnpm docker:down` | Stop all containers |
| `pnpm docker:logs` | View all logs |
| `pnpm docker:logs:bff` | View BFF logs |
| `pnpm docker:logs:core-api` | View Core API logs |

### Prisma Scripts
| Command | Description |
|---------|-------------|
| `pnpm prisma:generate` | Generate Prisma Client |
| `pnpm prisma:migrate:dev` | Create & run migrations (dev) |
| `pnpm prisma:migrate:deploy` | Run migrations (prod) |
| `pnpm prisma:migrate:reset` | Reset database |

### Validation Scripts
| Command | Description |
|---------|-------------|
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run all tests |
| `pnpm test:unit` | Run unit tests only |
| `pnpm validate` | Run lint + test + build |

---

## Three-Tier Testing Strategy

### Tier 1: Speed (Daily Development)
```bash
# Fast feedback loop
pnpm dev:bff
```
- 90% of development time
- Instant feedback
- Full debugging

### Tier 2: Accuracy (Pre-Commit)
```bash
# Validate build works
pnpm build:bff
pnpm start:bff
```
- Before every commit
- Catches bundling issues
- Tests production bundle

### Tier 3: Production Parity (Pre-Push)
```bash
# Full Docker validation
pnpm docker:build
pnpm docker:up
```
- Before pushing to Git
- After Dockerfile changes
- Production confidence

---

## Pre-Commit Checklist

Run these before every commit:

```bash
# 1. Lint code
pnpm lint

# 2. Run tests
pnpm test

# 3. Build with NX
pnpm build:bff

# 4. Test built bundle
pnpm start:bff

# Or use the validate script (does 1-3)
pnpm validate
```

---

## Pre-Push Checklist

Run these before pushing:

```bash
# 1. All pre-commit checks
pnpm validate

# 2. Build Docker image
pnpm docker:build

# 3. Test Docker container
pnpm docker:up

# 4. Verify health
curl http://localhost:3000/health  # BFF
curl http://localhost:3001/health  # Core API

# 5. Clean up
pnpm docker:down
```

---

## Debugging Workflows

### Debug Build Issues

**Check NX dependency graph:**
```bash
pnpm nx graph
```

**Build with verbose output:**
```bash
pnpm nx build bff --verbose
```

**Check bundle contents:**
```bash
ls -lh apps/api/bff/dist/
cat apps/api/bff/dist/server.js | grep "PrismaClient"
```

### Debug Docker Issues

**Build specific stage:**
```bash
docker build --target builder -t test-builder -f apps/api/bff/Dockerfile .
```

**Inspect stage:**
```bash
docker run -it test-builder sh
```

**Build with detailed output:**
```bash
docker compose build --no-cache --progress=plain bff
```

### Debug Runtime Issues

**View container logs:**
```bash
pnpm docker:logs:bff
```

**Exec into container:**
```bash
docker compose exec bff sh
```

**Check files in container:**
```bash
docker compose exec bff ls -la /app
docker compose exec bff cat /app/package.json
```

---

## Environment Variables

### Local Development (.env.local)
```env
DATABASE_URL="postgresql://whizard:whizard@localhost:5432/whizard"
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

### Docker (.env or docker-compose.yml)
```env
DATABASE_URL="postgresql://whizard:whizard@postgres:5432/whizard"
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

---

## Common Scenarios

### Scenario 1: Feature Development
```bash
# Start dev server
pnpm dev:bff

# Make changes, see hot reload
# Test manually

# Before commit
pnpm validate
```

### Scenario 2: Library Changes
```bash
# Make changes to libs/shared/domain

# Build library
pnpm nx build shared-domain

# Build app (includes library)
pnpm build:bff

# Test
pnpm start:bff
```

### Scenario 3: Dockerfile Changes
```bash
# Modify Dockerfile

# Build without cache
pnpm docker:build:nocache

# Test
pnpm docker:up

# Check logs
pnpm docker:logs:bff

# Clean up
pnpm docker:down
```

### Scenario 4: Prisma Schema Changes
```bash
# Modify prisma/schema.prisma

# Create migration
pnpm prisma:migrate:dev

# Restart dev server
pnpm dev:bff

# For Docker
pnpm docker:build
pnpm docker:up
```

---

## Tips & Best Practices

1. **Use watch mode** for development (`pnpm dev:bff`)
2. **Build locally** before committing (`pnpm build:bff`)
3. **Test Docker** before pushing (`pnpm docker:build`)
4. **Clean NX cache** if builds are stale (`pnpm nx reset`)
5. **Run migrations** from host, not in container
6. **Check healthchecks** to verify services are ready
7. **Use validate script** for quick pre-commit check

---

## Architecture Overview

```
Developer writes code
        ↓
pnpm dev:bff (hot reload during development)
        ↓
pnpm build:bff (NX builds libs, Vite bundles app)
        ↓
pnpm start:bff (test built bundle locally)
        ↓
pnpm docker:build (multi-stage Docker build)
        ↓
pnpm docker:up (run in production-like environment)
        ↓
Ready to push!
```

---

## Getting Help

- **Build Process**: See [build-process.md](./build-process.md)
- **NX Documentation**: https://nx.dev
- **Vite Documentation**: https://vitejs.dev
- **Prisma Documentation**: https://www.prisma.io/docs

---

## Quick Command Cheat Sheet

```bash
# Development
pnpm dev:bff                 # Hot reload dev
pnpm build:bff               # Build with NX
pnpm start:bff               # Run built bundle
pnpm validate                # Lint + test + build

# Docker
pnpm docker:build            # Build images
pnpm docker:up               # Start services
pnpm docker:logs:bff         # View logs
pnpm docker:down             # Stop services

# Database
pnpm prisma:migrate:dev      # Create migration
pnpm prisma:migrate:deploy   # Run migrations
pnpm prisma:generate         # Generate client

# Testing
pnpm test                    # Run all tests
pnpm test:unit               # Unit tests only
pnpm lint                    # Lint code
```
