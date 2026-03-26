# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Coding Conventions

- Do not create documentation files unless explicitly asked.
- Use comments sparingly — only for genuinely complex or non-obvious code.
- Always include `userId` and `tenantId` in log context wherever they are available.

## Database Table Naming Convention

All Prisma `@@map` table names must follow these rules:

- **Entities**: plural, lowercase, snake_case — e.g. `tenants`, `functional_groups`, `industry_roles`
- **Mapping tables**: `entity1_entity2` in alphabetical order, no `_mappings` suffix — e.g. `departments_functional_groups`, `capability_instances_industry_roles`
- **Abbreviations**: only when the entity name is longer than 2 words
  - `secondary_work_objects` (3 words) → `swos` ✓
  - `primary_work_objects` (3 words) → `pwos` ✓
  - `functional_groups` (2 words) → never `fg` ✗
  - `capability_instances` (2 words) → never `ci` ✗
- **Avoid**: camelCase, PascalCase, abbreviations for ≤2-word names, `_mappings` suffix on join tables

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

## WRCF Design System (v3.2)

All admin portal pages must use this system. Font: **Poppins** only (no Roboto/Inter).

### Color Tokens
| Token | Value | Usage |
|---|---|---|
| `bg.primary` | `#0F172A` | Page background, header |
| `bg.secondary` | `#0F253F` | Filter bar, dropdown bg, item hover |
| `bg.card` | `#1E293B` | Column/panel background |
| `bg.selected` | `#2D2A5A` | Selected item background |
| `text.primary` | `#E8F0FA` | Body text, titles |
| `text.secondary` | `#7F94AE` | Labels, muted text |
| `text.tertiary` | `#8AB4F8` | Item codes, helper text |
| `border` | `#484E5D` | All borders and dividers |
| `action` | `#314DDF` | Primary buttons, column/panel headers |
| `action.hover` | `#263FCC` | Button hover |
| `accent` | `#00BFFF` | Secondary buttons, selected left border, focus rings |

### Typography
| Style | Size | Weight | Line Height |
|---|---|---|---|
| h2 | 24px | 600 | 32px |
| h3 | 20px | 500 | 28px |
| bodyMd | 15px | 400 | 22px |
| label | 13px | 400 | 18px |
| caption | 12px | 400 | 16px |

### Component Specs
- **Header**: height 64px, paddingX 32px, bg `bg.primary`, title h2
- **Dropdown**: height 40px, paddingX 12px, radius 10px, bg `bg.secondary`, border `border`
- **Button primary**: height 40px, paddingX 16px, radius 10px, bg `action`, text `text.primary`
- **Button secondary**: height 40px, paddingX 16px, radius 10px, bg `accent`, text `bg.primary`
- **Selection column**: width 260px, radius 14px, bg `bg.card`; header height 56px bg `action` title h3; item height 48px bodyMd; selected: bg `bg.selected` + 4px left border `accent`
- **Badge**: 20×20px, radius 10px, bg `action`, caption text

### Key Entry Points

| File | Purpose |
|---|---|
| `apps/api/bff/src/server.ts` | BFF bootstrap |
| `apps/api/core-api/src/server.ts` | Core API bootstrap |
| `apps/web/admin-portal/src/main.ts` | Angular entry |
| `prisma/schema.prisma` | Database schema |
| `libs/shared/kernel/src/index.ts` | DDD base classes |
