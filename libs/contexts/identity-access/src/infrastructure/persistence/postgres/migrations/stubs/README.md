# IAM Migration Stubs

This folder contains review-first SQL stubs for the Identity and Access context.

## Current stub

- `0001_iam_schema.sql`

## Includes

- IAM schema creation (`iam`)
- Core IAM write-model tables
- Outbox table (`iam.outbox_events`) for append-only event publication
- Unique indexes, partial indexes, and check constraints for key invariants

## Promotion path

1. Review SQL against domain/application invariants.
2. Move approved SQL into `data/postgres/migrations/contexts/identity-access`.
3. Apply migration in a controlled environment.
4. Regenerate Prisma artifacts if Prisma models are updated.
