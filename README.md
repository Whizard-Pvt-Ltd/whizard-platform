# whizard-platform

Monorepo for complete whizard platform. Typical Nx assisted DDD framework over PEAN with additional BFF using Fastify instead of standard Express.

Initial DDD monorepo scaffold focused on `identity-access` using:
- pnpm workspace
- Prisma (PostgreSQL)
- Vitest

## Setup

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm test
```
