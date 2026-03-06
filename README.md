# Whizard Platform

Whizard Platform is a DDD-first monorepo designed for multi-tenant workflows across governance, education, company, and workforce domains.

This repository is scaffolded as a modular monolith with strict bounded-context boundaries and an event-driven integration model.

## Architecture Direction

- Frontend: Angular apps in Nx-style `apps/web/*` plus shared UI libraries.
- Backend: Fastify BFF + Fastify APIs + async workers.
- Persistence: PostgreSQL with context-owned schema slices and migrations.
- Messaging: Kafka for integration events, projections, retries, and dead-letter handling.
- Contracts: versioned API and event contracts per context.

## Current Implementation Scope

The first implemented boundary context is `identity-access`, with foundational work for:

- Domain aggregates for user identity, access policy, and user session.
- Application command handlers and ports.
- Infrastructure persistence adapters (Prisma repositories/mappers).
- Outbox-backed event persistence path.
- Initial IAM SQL migration and Prisma schema models.

## Repository Layout

```text
whizard-platform/
  apps/
    web/                 # admin/student/college/company portals
    api/                 # bff + core-api
    workers/             # orchestrator/projection/scheduler
  libs/
    contexts/            # bounded contexts
    shared/              # kernel/application/domain/infrastructure/contracts/ui
  integrations/          # external and internal platform integrations
  data/                  # postgres, kafka, local/dev infra assets
  docs/                  # architecture, ADRs, domain, api, runbooks
  tools/                 # scripts, generators, lint/test/ci tooling
  tests/                 # e2e, contract, performance, smoke
```

## Context Folder Contract

Each bounded context follows the same structure:

- `presentation/` for HTTP and messaging transport.
- `application/` for commands, queries, handlers, policies, and ports.
- `domain/` for pure business models (framework-agnostic).
- `infrastructure/` for persistence, messaging, integrations, and observability.
- `contracts/` for versioned API and event payloads.
- `tests/` for unit/integration fixtures and builders.

## Local Setup

### Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL 15+ (or compatible)

### Install and Bootstrap

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
```

### Verify

```bash
pnpm lint
pnpm test
pnpm build
```

## Database and Migrations

- Prisma schema: `prisma/schema.prisma`
- Context migration ownership: `data/postgres/migrations/contexts/identity-access`

Apply migrations in development:

```bash
pnpm prisma:migrate:dev
```

Deploy migrations:

```bash
pnpm prisma:migrate:deploy
```

## Guiding Rules

- Keep domain model framework-free.
- Enforce ports-before-adapters design.
- Never publish raw domain objects directly to Kafka.
- Use outbox pattern for reliable event publication.
- Keep cross-context dependencies contract-based, not table-based.

## Contribution Rules

- Place code in the correct layer first; avoid "temporary" cross-layer shortcuts.
- Domain layer (`domain/`) must not import Fastify, Prisma, Kafka, or framework runtime code.
- Application layer may depend on `domain` and `application/ports`, never on transport concerns.
- Infrastructure layer implements ports; do not leak infrastructure types into domain contracts.
- Do not import private internals of another context; consume only `public-api.ts` exports.
- Use kebab-case for folders/files and explicit suffixes: `.handler.ts`, `.repository.ts`, `.producer.ts`, `.consumer.ts`, `.mapper.ts`, `.gateway.ts`.
- Version externally published contracts and events (`*.v1.ts`, `*.v2.ts`).
- Keep migrations context-owned under `data/postgres/migrations/contexts/<context>`.
- Add or update tests with each behavior change:
  - context unit/integration tests near the context
  - cross-context/API/event contracts under `tests/contract`
- Keep docs in sync: update architecture notes/ADR/domain docs when boundaries or contracts change.

## AI Notes Convention

To keep AI-generated work traceable without process overhead, use one short note per Codex task:

- Folder: `docs/ai-notes/`
- File format: `YYYY-MM-DD-short-name.md`
- Template: `docs/ai-notes/TEMPLATE.md`

Rule:
- No Codex-driven code change without a matching `docs/ai-notes/*.md` note.
- In PR description, link the note file.

## Next Milestones

- Implement Fastify IAM modules in BFF/core API.
- Add transaction orchestration for command-side use cases.
- Add outbox publisher worker and IAM event topic bindings.
- Add architecture tests and dependency boundary enforcement.
