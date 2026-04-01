# Node 24 + Angular 21 Upgrade Action Plan

Last updated: 2026-03-25

Working branch: `node24-angular21-upgrade`

## Goal

Upgrade this workspace to:

- Node.js 24.x LTS
- Angular 21.x
- TypeScript 5.9.x as required by Angular 21

Keep the backend build, Angular app build, CI, and Docker images green throughout the rollout.

## Current Repository Baseline

- Workspace package manager: `pnpm@10.6.0`
- Local verified runtime: `node v22.22.2`
- Nx report: `nx 22.6.1`
- Angular baseline: `19.2.x`
- TypeScript baseline: `5.8.2`
- Angular dependencies are duplicated in:
- root `package.json`

-`apps/web/admin-portal/package.json`

- Node 22 is hardcoded in:

-`.github/workflows/ci.yml`

-`.github/workflows/docker-image-whizard-api.yml`

-`apps/web/admin-portal/Dockerfile`

-`apps/api/bff/Dockerfile`

-`apps/api/core-api/Dockerfile`

-`README.md`

- There is a stray npm lockfile in `apps/web/admin-portal/package-lock.json` inside a pnpm workspace.
- Current baseline is not fully green:

-`pnpm build:all` fails at `web-admin-portal:build`

- Angular compiler crashes with `Cannot destructure property 'pos' of 'file.referencedFiles[index]' as it is undefined`

## Constraints

- Do not overwrite or revert unrelated local changes already present in the worktree.
- Keep package manager ownership consistent: pnpm only.
- Upgrade Angular one major at a time: 19 -> 20 -> 21.
- Validate after each major step before moving forward.
- Keep Nx changes minimal during the Angular rollout. Only take Nx changes that are necessary for compatibility.

## Success Criteria

-`pnpm install` succeeds on Node 24

-`pnpm build` succeeds

-`pnpm build:web-admin` succeeds

-`pnpm build:all` succeeds

-`pnpm test:unit` succeeds

-`pnpm test:integration` succeeds

- CI workflows use Node 24
- All Dockerfiles build with Node 24 base images

-`apps/web/admin-portal/package-lock.json` is removed

## Upgrade Strategy

1. Stabilize the current Angular 19 admin app build so pre-existing breakage is separated from upgrade regressions.
2. Normalize toolchain ownership and version pinning.
3. Move the repo runtime from Node 22 to Node 24.
4. Upgrade Angular from 19 to 20.
5. Upgrade Angular from 20 to 21.
6. Re-run validation locally and in CI/Docker.
7. Do optional post-upgrade cleanup only after the main rollout is green.

## Execution Checklist PR-by-PR

### PR 1: Baseline Stabilization and Workspace Hygiene

Objective: make the current branch diagnosable and reduce upgrade noise.

Checklist:

- [ ] Reproduce `pnpm build:web-admin`
- [ ] Isolate the Angular compiler crash to a file, config, or TypeScript interaction
- [ ] Fix the Angular 19 baseline build if required before version bumps
- [ ] Remove `apps/web/admin-portal/package-lock.json`
- [ ] Confirm only pnpm is used in docs and scripts
- [ ] Decide whether Angular deps remain duplicated in both package manifests or are centralized
- [ ] Record the final dependency ownership decision in this file or README

Expected files:

-`apps/web/admin-portal/package-lock.json` removed

-`package.json`

-`apps/web/admin-portal/package.json`

- optional Angular config or source files if baseline fix is needed

Validation:

- [ ] `pnpm install`
- [ ] `pnpm build:web-admin`
- [ ] `pnpm build:all`

### PR 2: Node 24 Runtime Rollout

Objective: move local, CI, and Docker runtime references to Node 24 without changing Angular yet.

Checklist:

- [ ] Add a root `.nvmrc` with `24`
- [ ] Add `engines.node` to root `package.json`
- [ ] Update GitHub Actions from Node 22 to Node 24
- [ ] Update all Dockerfiles from `node:22-alpine` to `node:24-alpine`
- [ ] Update README and local-development docs to state Node 24
- [ ] Reinstall dependencies and refresh the pnpm lockfile under Node 24 if needed

Expected files:

-`.nvmrc`

-`package.json`

-`.github/workflows/ci.yml`

-`.github/workflows/docker-image-whizard-api.yml`

-`apps/web/admin-portal/Dockerfile`

-`apps/api/bff/Dockerfile`

-`apps/api/core-api/Dockerfile`

-`README.md`

- relevant docs under `docs/`

Validation:

- [ ] `node -v` shows Node 24
- [ ] `pnpm install`
- [ ] `pnpm build`
- [ ] `pnpm build:all`
- [ ] Docker builds still complete

### PR 3: Angular 19 -> 20

Objective: complete the first framework major upgrade with migrations.

Checklist:

- [ ] Run Angular update from workspace root for v20
- [ ] Update Angular packages in both root and app-level manifests
- [ ] Accept migration-generated config/code changes
- [ ] Review `angular.json`, tsconfig files, and builder changes
- [ ] Keep RxJS and Zone.js versions aligned with Angular 20 expectations
- [ ] Re-run lint/build/tests before proceeding

Suggested commands:

```bash

pnpmexecngupdate@angular/core@20@angular/cli@20

pnpminstall

pnpmbuild:web-admin

pnpmbuild:all

```

Expected files:

-`package.json`

-`pnpm-lock.yaml`

-`apps/web/admin-portal/package.json`

-`angular.json`

- Angular source/config files touched by migrations

Validation:

- [ ] `pnpm build:web-admin`
- [ ] `pnpm build:all`
- [ ] `pnpm test:unit`

### PR 4: Angular 20 -> 21 and TypeScript 5.9 Alignment

Objective: land the final supported Angular target and required TypeScript line.

Checklist:

- [ ] Run Angular update from workspace root for v21
- [ ] Upgrade TypeScript from `5.8.2` to a `5.9.x` version supported by Angular 21
- [ ] Update the root pnpm override for TypeScript
- [ ] Update Angular packages in both manifests to 21.x
- [ ] Review standalone bootstrap, router, HTTP, and signal-based code for migration side effects
- [ ] Rebuild the admin app and the full workspace

Suggested commands:

```bash

pnpmexecngupdate@angular/core@21@angular/cli@21

pnpminstall

pnpmbuild:web-admin

pnpmbuild:all

```

Expected files:

-`package.json`

-`pnpm-lock.yaml`

-`apps/web/admin-portal/package.json`

-`angular.json`

- any Angular migration output

Validation:

- [ ] `pnpm build`
- [ ] `pnpm build:web-admin`
- [ ] `pnpm build:all`
- [ ] `pnpm test:unit`
- [ ] `pnpm test:integration`

### PR 5: Final Validation, CI Hardening, and Cleanup

Objective: verify the whole delivery path after the framework upgrade.

Checklist:

- [ ] Run the full validation sequence on Node 24
- [ ] Build all Docker images
- [ ] Verify CI commands still match the upgraded workspace
- [ ] Remove dead comments or stale version references
- [ ] Decide whether to keep or remove duplicated Angular dependencies between root and app manifest
- [ ] Document any remaining known issues

Validation:

- [ ] `pnpm lint`
- [ ] `pnpm test:unit`
- [ ] `pnpm test:integration`
- [ ] `pnpm build`
- [ ] `pnpm build:all`
- [ ] `docker compose build bff core-api`
- [ ] `docker build -f apps/web/admin-portal/Dockerfile .`

## Risks to Watch

- Angular compiler instability may be caused by the current Angular 19 + TypeScript 5.8.2 state rather than the future upgrade.
- Duplicated Angular dependencies in two `package.json` files can drift during migrations.
- Docker images use pinned Node base images and will silently diverge from CI if not updated in the same PR series.
- Prisma generation in postinstall can complicate dependency reinstall/debug loops.
- Existing unrelated worktree changes in `pnpm-lock.yaml` and `tsconfig.base.json` must be preserved carefully during merge or rebase operations.

## Recommended Order of Execution

1. PR 1
2. PR 2
3. PR 3
4. PR 4
5. PR 5

## Decisions Recorded

- For the Angular 19 -> 21 rollout, keep Angular dependencies declared in both the root `package.json` and `apps/web/admin-portal/package.json`.
- Update both manifests together during each Angular major migration.
- Revisit manifest deduplication only in PR 5 after the upgraded workspace is green.

## Notes During Execution

- Commit after each migration hop.
- Do not combine Node 24 rollout and Angular major migration in the same PR.
- If PR 1 proves the Angular 19 compiler crash disappears when Angular 20 is installed, document that finding and collapse the baseline fix into PR 3.
