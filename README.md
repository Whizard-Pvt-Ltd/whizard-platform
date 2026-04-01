# Whizard Platform

A DDD-first multi-tenant platform for governance, education, company, and workforce domains. Built with Angular, Fastify, Prisma, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 24+
- **pnpm** 10+ (`npm install -g pnpm@10`)
- **PostgreSQL** 15+ (running on port 5432)

### Get Running in 3 Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Setup database
pnpm run db:setup

# 3. Start everything
pnpm run dev:all
# Logs automatically stream to your terminal!
# Press Ctrl+C to stop all services
```

**Open:** http://localhost:4200

**Login with:**

- Email: `test@whizard.com`
- Password: `Test@123`

**📖 New to logging?** Check the [Logging Quick Start Guide](./LOGGING-QUICKSTART.md)

---

## Table of Contents

- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Getting Started](#getting-started)
- [Development](#development)
- [Database &amp; Migrations](#database--migrations)
- [Testing](#testing)
- [DDD Principles](#ddd-principles)
- [Troubleshooting](#troubleshooting)

---

## Architecture

### System Overview

```
┌──────────────────┐
│ Angular App      │  :4200  ← Admin Portal
│ (admin-portal)   │
└────────┬─────────┘
         │ HTTP
         ↓
┌──────────────────┐
│ Fastify BFF      │  :3000  ← /iam/auth/*, /iam/access/*
└────────┬─────────┘
         │ HTTP
         ↓
┌──────────────────┐
│ Fastify Core API │  :3001  ← /admin/iam/*
└────────┬─────────┘
         │ SQL
         ↓
┌──────────────────┐
│ PostgreSQL       │  :5432  ← IAM Schema
└──────────────────┘
```

### Technology Stack

- **Frontend**: Angular 19 (standalone components)
- **Backend**: Fastify (BFF + Core API)
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Messaging**: Kafka (for integration events)
- **Architecture**: Domain-Driven Design with bounded contexts

### Current Features

✅ **Authentication Flow** (Angular → BFF → IAM Context → PostgreSQL)

- Local password authentication with Scrypt hashing
- JWT token generation (access + refresh tokens)
- Session management with expiry tracking
- Protected routes with auth guards

✅ **Dashboard**

- User profile display
- Session information
- Logout functionality

✅ **Security**

- Bearer token authentication
- HTTP interceptors
- Route guards
- CORS configuration

---

## Repository Layout

```text
whizard-platform/
├── apps/
│   ├── api/
│   │   ├── bff/              ← Backend for Frontend (:3000)
│   │   │   ├── src/
│   │   │   │   ├── modules/iam/
│   │   │   │   │   ├── auth/    ← Login, MFA, session routes
│   │   │   │   │   └── access/  ← User profile, permissions
│   │   │   │   ├── main.ts      ← Dependency wiring
│   │   │   │   └── server.ts    ← Fastify bootstrap
│   │   │   └── tsconfig.json
│   │   └── core-api/         ← Core Business API (:3001)
│   │       ├── src/
│   │       │   ├── modules/iam/
│   │       │   │   ├── access/       ← Admin role management
│   │       │   │   ├── federation/   ← SSO configuration
│   │       │   │   └── provisioning/ ← User lifecycle
│   │       │   └── server.ts
│   │       └── tsconfig.json
│   ├── web/
│   │   └── admin-portal/     ← Angular Admin Portal (:4200)
│   │       ├── src/
│   │       │   ├── app/
│   │       │   │   ├── core/
│   │       │   │   │   ├── guards/       ← Auth guards
│   │       │   │   │   ├── interceptors/ ← HTTP interceptors
│   │       │   │   │   └── services/     ← Auth, token storage
│   │       │   │   ├── pages/
│   │       │   │   │   ├── login/        ← Login page
│   │       │   │   │   └── dashboard/    ← Dashboard
│   │       │   │   └── app.routes.ts
│   │       │   └── main.ts
│   │       └── project.json
│   └── workers/              ← Async workers (orchestrator, projections)
├── libs/
│   ├── contexts/
│   │   └── identity-access/  ← IAM Bounded Context (DDD)
│   │       ├── src/
│   │       │   ├── domain/           ← Aggregates, entities, VOs
│   │       │   │   ├── aggregates/
│   │       │   │   ├── entities/
│   │       │   │   └── value-objects/
│   │       │   ├── application/      ← Use cases, commands, ports
│   │       │   │   ├── command-handlers/
│   │       │   │   ├── commands/
│   │       │   │   ├── dto/
│   │       │   │   ├── ports/
│   │       │   │   └── policies/
│   │       │   ├── infrastructure/   ← Adapters (Prisma, Kafka)
│   │       │   │   ├── config/
│   │       │   │   ├── messaging/
│   │       │   │   ├── persistence/
│   │       │   │   └── security/
│   │       │   └── contracts/        ← Versioned API/event contracts
│   │       └── index.ts
│   └── shared/               ← Shared utilities, domain kernel
├── tools/
│   └── scripts/              ← Build automation, setup scripts
│       ├── bootstrap.sh
│       ├── build-iam.sh
│       ├── db-setup.sh
│       ├── dev-all.sh
│       └── create-test-user.ts
├── prisma/
│   ├── schema.prisma         ← Database schema
│   └── migrations/           ← Database migrations
├── logs/                     ← Server logs (bff.log, core-api.log)
├── docs/                     ← Architecture, ADRs, domain docs
└── tests/                    ← E2E, contract, performance tests
```

---

## Getting Started

### Step 1: Setup PostgreSQL

#### Option A: Docker (Recommended)

```bash
docker run --name whizard-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=whizard \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps | grep whizard-postgres
```

#### Option B: Local PostgreSQL

```bash
# Create database
psql -U postgres -c "CREATE DATABASE whizard;"

# Verify connection
psql postgresql://postgres:postgres@localhost:5432/whizard -c "SELECT 1"
```

### Step 2: Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# This will:
# - Install Node modules
# - Generate Prisma client
# - Setup workspace
```

### Step 3: Configure Environment

The `.env` file is pre-configured with sensible defaults. Review and update if needed:

```bash
# View current configuration
cat .env

# Key variables:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/whizard"
IAM_ACCESS_TOKEN_SECRET="whizard-iam-access-secret-key-change-in-production-min-32-chars"
IAM_REFRESH_TOKEN_SECRET="whizard-iam-refresh-secret-key-change-in-production-min-32-chars"
```

**⚠️ Important:** Change JWT secrets in production!

### Step 4: Setup Database

```bash
# Run migrations and generate Prisma client
pnpm run db:setup

# This will:
# - Generate Prisma client
# - Run all migrations (creates IAM schema)
# - Verify database connection
```

### Step 5: Create Test User

```bash
# Create a test user for login
npx tsx tools/scripts/create-test-user.ts

# Credentials:
# Email: test@whizard.com
# Password: Test@123
```

### Step 6: Start Development Servers

#### Option A: All Servers Together

```bash
pnpm run dev:all

# This starts:
# - Core API on :3001
# - BFF on :3000
# - Angular on :4200
#
# Press Ctrl+C to stop all
```

#### Option B: Individual Servers

```bash
# Terminal 1: Core API
pnpm run dev:core-api

# Terminal 2: BFF
pnpm run dev:bff

# Terminal 3: Angular
pnpm run start:web-admin
```

### Step 7: Verify Installation

Open your browser and check:

**Angular App:**

```
http://localhost:4200
```

**BFF Health:**

```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","service":"bff","timestamp":"..."}
```

**Core API Health:**

```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","service":"core-api","timestamp":"..."}
```

**Test Login:**

```bash
curl -X POST http://localhost:3000/iam/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "test@whizard.com",
    "password": "Test@123",
    "clientContext": "web"
  }'
```

---

## Development

### Available Scripts

#### Build & Setup

```bash
pnpm run bootstrap          # Install deps + verify env + generate Prisma
pnpm run verify:env         # Check required environment variables
pnpm run build:iam          # Full DDD-compliant build
```

#### Database

```bash
pnpm run db:setup                   # Generate client + run migrations
pnpm run prisma:generate            # Generate Prisma client only
pnpm run prisma:migrate:dev         # Create new migration
pnpm run prisma:migrate:deploy      # Apply migrations (production)
```

#### Development Servers

```bash
pnpm run dev:all            # Start all servers
pnpm run dev:bff            # Start BFF only (:3000)
pnpm run dev:core-api       # Start Core API only (:3001)
pnpm run start:web-admin    # Start Angular only (:4200)
```

#### Testing

```bash
pnpm run test               # Run all tests
pnpm run test:unit          # Unit tests only
pnpm run test:integration   # Integration tests
pnpm run test:e2e           # E2E tests
pnpm run test:watch         # Watch mode
```

#### Linting

```bash
pnpm run lint               # Lint all code
pnpm run lint:fix           # Auto-fix linting issues
```

### View Logs

When running `pnpm dev:all`, logs are **automatically streamed** to your terminal. You can also view them separately:

```bash
# Real-time logs from all services
tail -f logs/bff.log logs/core-api.log logs/angular.log

# Individual service logs
tail -f logs/bff.log
tail -f logs/core-api.log
tail -f logs/angular.log

# Or use less for scrolling
less logs/bff.log
```

**Configure Log Verbosity:**

```bash
# Edit .env
LOG_LEVEL="debug"  # Options: debug, info, warn, error

# Then restart services
pnpm dev:all
```

📖 **See [Logging Quick Start Guide](./LOGGING-QUICKSTART.md)** for complete logging documentation.

### Hot Reload

- **Angular**: Automatic browser refresh on file changes
- **Fastify (BFF & Core API)**: Automatic restart via tsx
- **Prisma**: Regenerate client after schema changes with `pnpm prisma:generate`

---

## Database & Migrations

### Schema Location

The Prisma schema is located at: `prisma/schema.prisma`

### Current Schema

```prisma
// IAM Schema
model UserAccount { ... }      // User accounts
model UserCredential { ... }   // Password hashes
model UserSession { ... }      // Active sessions
model AccessPrincipal { ... }  // RBAC principals
model RoleAssignment { ... }   // Role bindings
model PermissionGrant { ... }  // Permission grants
model ScopeRestriction { ... } // Data scopes
model OutboxEvent { ... }      // Event sourcing
```

### Creating Migrations

```bash
# 1. Edit prisma/schema.prisma
# 2. Generate migration
pnpm run prisma:migrate:dev --name add_new_feature

# 3. Apply migration
pnpm run prisma:migrate:deploy
```

### Migration Ownership

Migrations are context-owned:

- IAM migrations: `prisma/migrations/`
- Future contexts: `data/postgres/migrations/contexts/<context>`

### Reset Database (Development Only)

```bash
# WARNING: This deletes all data!
pnpm run prisma:migrate:reset
```

---

## Testing

### Test Structure

```
tests/
├── contract/      # API contract tests
├── e2e/           # End-to-end tests
└── performance/   # Load tests
```

Context-specific tests live in the context folder:

```
libs/contexts/identity-access/
└── tests/
    ├── unit/           # Domain/application tests
    └── integration/    # Infrastructure tests
```

### Running Tests

```bash
# All tests
pnpm run test

# Unit tests only
pnpm run test:unit

# Integration tests
pnpm run test:integration

# Watch mode
pnpm run test:watch

# Coverage
pnpm run test:coverage
```

---

## DDD Principles

This project follows **Domain-Driven Design** with strict bounded-context boundaries.

### Context Structure

Each bounded context follows:

```
libs/contexts/<context>/
├── domain/             # Pure business logic (framework-free)
│   ├── aggregates/     # Aggregate roots
│   ├── entities/       # Domain entities
│   └── value-objects/  # Immutable VOs
├── application/        # Use cases and ports
│   ├── command-handlers/
│   ├── ports/
│   └── policies/
├── infrastructure/     # Adapters (Prisma, Kafka, etc.)
│   ├── persistence/
│   ├── messaging/
│   └── security/
├── contracts/          # Versioned API/event contracts
└── tests/             # Context tests
```

### Guiding Rules

1. **Domain Layer Must Be Framework-Free**

   - No Fastify, Prisma, Kafka, or framework imports in `domain/`
   - Domain models are pure TypeScript/business logic
2. **Ports Before Adapters**

   - Define interfaces (ports) in application layer
   - Implement adapters in infrastructure layer
3. **Never Publish Raw Domain Objects**

   - Use DTOs/contracts for external communication
   - Domain events → Event envelopes
4. **Outbox Pattern for Events**

   - Reliable event publication
   - Transactional guarantees
5. **Contract-Based Cross-Context Dependencies**

   - Never import another context's internals
   - Only consume `public-api.ts` exports

### File Naming Conventions

- Use kebab-case: `user-account.aggregate.ts`
- Explicit suffixes:
  - `.handler.ts` - Command/query handlers
  - `.repository.ts` - Repositories
  - `.gateway.ts` - External gateways
  - `.mapper.ts` - Data mappers
  - `.producer.ts` - Event producers
  - `.consumer.ts` - Event consumers

### Versioned Contracts

External contracts must be versioned:

```
contracts/
├── api/
│   ├── authenticate-with-password.request.v1.ts
│   └── authenticate-with-password.response.v1.ts
└── events/
    └── iam-user-account-created.v1.ts
```

---

## Troubleshooting

### PostgreSQL Not Running

```bash
# Check if running
docker ps | grep whizard-postgres

# Start if stopped
docker start whizard-postgres

# Check logs
docker logs whizard-postgres
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # BFF
lsof -i :3001  # Core API
lsof -i :4200  # Angular

# Kill process
kill -9 <PID>
```

### Prisma Client Not Found

```bash
# Regenerate Prisma client
pnpm prisma:generate

# Or full db setup
pnpm run db:setup
```

### Build Errors

```bash
# Clean everything
rm -rf node_modules dist .angular logs

# Reinstall
pnpm install

# Rebuild
pnpm run build:iam
```

### Login Not Working

```bash
# Check BFF is running
curl http://localhost:3000/health

# Check user exists
psql postgresql://postgres:postgres@localhost:5432/whizard \
  -c "SELECT * FROM iam_user_accounts WHERE \"primaryEmail\" = 'test@whizard.com';"

# Recreate test user
npx tsx tools/scripts/create-test-user.ts
```

### Environment Variable Issues

```bash
# Verify all required vars
pnpm run verify:env

# Re-source .env
source .env
```

---

## What You Have Now

✅ **Full-stack Authentication System**

- Angular login page with validation
- Fastify BFF with auth routes
- DDD-compliant IAM context
- PostgreSQL with Prisma

✅ **Security**

- Scrypt password hashing
- JWT token issuance
- Bearer token authentication
- Protected routes

✅ **Developer Experience**

- Hot reload for all services
- Comprehensive logging
- Type-safe end-to-end
- DDD architecture enforced

---

## Next Steps

### 1. Add More Features

- User registration
- Password reset
- Email verification
- Multi-factor authentication (MFA)
- Social login (OAuth)

### 2. Implement Authorization

- Role-based access control (RBAC)
- Permission checking
- Tenant isolation
- Data scopes

### 3. Add Monitoring

- Application metrics
- Error tracking
- Performance monitoring
- Audit logging

### 4. Deploy to Production

- Containerize with Docker
- Setup CI/CD pipeline
- Configure secrets management
- Add health checks

---

## Contribution Guidelines

1. **Layer Separation**

   - Place code in the correct layer
   - No "temporary" cross-layer shortcuts
2. **Domain Purity**

   - Domain layer must not import framework code
   - Keep business logic framework-agnostic
3. **Port-Adapter Pattern**

   - Application layer depends on ports
   - Infrastructure implements adapters
   - Never leak infrastructure types into domain
4. **Context Boundaries**

   - No private imports across contexts
   - Use `public-api.ts` exports only
5. **Testing**

   - Add tests with behavior changes
   - Unit tests for domain/application
   - Integration tests for infrastructure
   - Contract tests for API boundaries
6. **Documentation**

   - Update docs when boundaries change
   - Document architectural decisions (ADRs)
   - Keep README in sync

---

## AI Notes Convention

For AI-generated work traceability:

- Folder: `docs/ai-notes/`
- Format: `YYYY-MM-DD-short-name.md`
- Template: `docs/ai-notes/TEMPLATE.md`

**Rule:** No AI-driven code change without a matching note file.

---

## Architecture Resources

- **Domain Models**: `libs/contexts/identity-access/src/domain/`
- **Use Cases**: `libs/contexts/identity-access/src/application/command-handlers/`
- **API Routes**: `apps/api/bff/src/modules/iam/`
- **Database Schema**: `prisma/schema.prisma`
- **Logging Infrastructure**: `libs/shared/infrastructure/src/logging.ts`

---

## Documentation

### Quick Guides

- 📋 **[Logging Quick Start](./LOGGING-QUICKSTART.md)** - How to use logging in your code
- 📊 **[Viewing Logs](./docs/runbooks/VIEWING-LOGS.md)** - Log viewing and troubleshooting
- 🏗️ **[Logging Architecture](./docs/architecture/LOGGING.md)** - Complete implementation guide

### Developer Guides

- 🚀 **[Local Development &amp; Testing](./docs/engineering/local-development.md)** - Complete guide to local development, building, and testing workflows
- 🏗️ **[Build Process](./docs/engineering/build-process.md)** - Deep dive into NX + Vite build system and Docker multi-stage builds

### Architecture Docs

- **Domain Documentation**: `docs/domain/`
- **Architecture Decisions**: `docs/adr/`
- **API Documentation**: `docs/api/`
- **Runbooks**: `docs/runbooks/`

---

## Support

- **Documentation**: `docs/` folder
- **Scripts**: `tools/scripts/`
- **Logs**: `logs/` folder (automatically created by `dev:all`)
- **Issues**: Check service logs for error details

---

**Ready to build!** 🚀

Built with ❤️ using Angular, Fastify, Prisma, and PostgreSQL.
