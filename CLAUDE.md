# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Coding Conventions

- Do not create documentation files unless explicitly asked.
- Use comments sparingly — only for genuinely complex or non-obvious code.

## Package Manager

Use **pnpm** exclusively. Never use npm or yarn.

## Commands

### Development
```bash
pnpm run bootstrap          # Full setup: install deps, setup DB, generate Prisma client
pnpm run dev:all            # Start all services with log streaming
pnpm run dev:bff            # BFF only (port 3000)
pnpm run dev:core-api       # Core API only (port 3001)
pnpm start:web-admin        # Angular admin portal (port 4200)
```

### Building
```bash
pnpm build                  # TypeScript type check
pnpm build:all              # Build all apps via Nx
pnpm build:bff              # Build BFF only
pnpm build:core-api         # Build Core API only
pnpm build:web-admin        # Build Angular admin portal
```

### Testing
```bash
pnpm test                   # Unit tests
pnpm test:watch             # Unit tests in watch mode
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests
pnpm test:contract          # Contract tests
pnpm test:e2e               # E2E tests
pnpm test:all               # All tests except E2E
```

To run a single test file: `pnpm vitest run path/to/test.spec.ts`

### Database
```bash
pnpm run db:setup               # Setup DB and run migrations
pnpm run prisma:generate        # Regenerate Prisma client after schema changes
pnpm run prisma:migrate:dev     # Create a new migration
pnpm run prisma:migrate:deploy  # Deploy migrations to target environment
```

### Code Quality
```bash
pnpm lint                   # Check linting issues
pnpm lint:fix               # Auto-fix linting issues
pnpm validate               # Full validation: lint + test + build
```

## Architecture

### Monorepo Layout

```
apps/
  api/
    bff/          → Backend-for-Frontend gateway (port 3000, Fastify)
    core-api/     → Core business API (port 3001, Fastify)
  web/
    admin-portal/ → Angular 19 admin SPA (port 4200)
    company-portal, student-portal, college-portal
  workers/        → Async workers (scheduler, orchestrator, projection-updater)
libs/
  contexts/       → DDD bounded contexts (see below)
  shared/
    kernel/       → DDD building blocks (base classes, interfaces)
    infrastructure/ → Prisma adapters, auth helpers
    logging/      → Pino-based structured logger
    ui/           → Shared Angular components
    core-api-client/ → HTTP client for Core API
prisma/           → Single PostgreSQL schema + migrations
tools/scripts/    → Build automation and dev scripts
```

### DDD Bounded Contexts

Each context under `libs/contexts/` follows this layered structure:

```
{context}/src/
  domain/         → Aggregates, entities, value objects, policies (no framework deps)
  application/    → Command handlers, commands, DTOs, ports
  infrastructure/ → Prisma repositories, adapters, security
  contracts/      → Versioned API/event schemas
  index.ts        → Public API barrel export
```

**Layer dependency rule** (enforced by ESLint): `domain → application → infrastructure`. Cross-context imports must only use the public `index.ts` entry point.

Current bounded contexts: `identity-access`, `enterprise-workforce`, `student-lifecycle`, `capability-framework`, `certification-progression`, `internship-hiring`, `governance`, `college-operations`, `company-organization`, `communication-social`, `analytics-readiness`, `billing-subscription`.

### Service Architecture

- **BFF** proxies frontend requests to Core API; handles auth and tenant-scoped routing
- **Core API** owns all business logic and IAM admin endpoints
- **Workers** consume Kafka events for async processing (projections, scheduling)
- Single PostgreSQL database; all schemas in `prisma/schema.prisma`
- Multi-tenancy: `TenantType` + `TenantId` are present throughout domain models

### Testing Strategy

Four separate Vitest configs:
- `vitest.config.unit.ts` — fast, isolated, no I/O
- `vitest.config.integration.ts` — tests layers together, hits real DB
- `vitest.config.contract.ts` — inter-service schema compatibility
- `vitest.config.e2e.ts` — full system

Coverage thresholds: 70% lines/functions/statements, 60% branches.

### Import Aliases

TypeScript path aliases are defined in `tsconfig.base.json` under the `@whizard/` namespace (e.g., `@whizard/shared-kernel`, `@whizard/shared-logging`). Always use these aliases instead of relative cross-package paths.

### Key Entry Points

| File | Purpose |
|---|---|
| `apps/api/bff/src/server.ts` | BFF bootstrap |
| `apps/api/core-api/src/server.ts` | Core API bootstrap |
| `apps/web/admin-portal/src/main.ts` | Angular entry |
| `prisma/schema.prisma` | Database schema |
| `libs/shared/kernel/src/index.ts` | DDD base classes |
