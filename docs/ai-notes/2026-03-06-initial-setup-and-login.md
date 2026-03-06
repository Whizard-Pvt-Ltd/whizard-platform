# initial-setup-and-login

Date: 2026-03-06
Commits: `58a0bd6`, `a99dbd6`, `5a79aa2`

## Goal
Set up the monorepo from initial DDD requirements, establish a lightweight AI workflow convention, and ship the first Angular admin login page.

## Prompt to Codex
- Build repository structure and first identity-access boundary from design doc using Prisma + Vitest.
- Update README with architecture and contribution conventions.
- Set up Angular `admin-portal` and generate the first login page based on provided Figma/screenshot.
- Add guardrails to enforce AI-note traceability and architecture boundaries in CI/lint.

## Plan
- scaffold root configs and full folder structure
- implement identity-access domain/application/infrastructure baseline
- add Prisma IAM schema and context-owned SQL migration
- rewrite README and add AI notes convention/template
- configure Angular workspace and scripts
- build and style login page, then fix TypeScript/Angular compatibility
- enforce AI note requirement in CI for PR code changes
- enforce layer and cross-context import boundaries with ESLint

## Output
- monorepo scaffold completed for apps/libs/integrations/data/docs/tools/tests
- identity-access first boundary implemented with repositories, mappers, outbox path, and migration
- README upgraded with architecture direction, rules, and AI-notes convention
- `docs/ai-notes/TEMPLATE.md` added
- Angular app runtime wired for `apps/web/admin-portal`
- first login page implemented and styled to screenshot direction
- TypeScript pinned/overridden to `5.8.2` for Angular 19 compatibility
- added CI check script `tools/scripts/check-ai-notes.sh` and PR workflow enforcement
- added ESLint boundary rules to block invalid layer imports and cross-context private imports
