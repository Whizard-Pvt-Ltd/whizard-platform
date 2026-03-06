# identity-access

Bounded context for identity and access management.

Current first-boundary implementation:
- `UserIdentity` aggregate (`register-local-user`)
- `UserSession` aggregate (`start-user-session`)
- `AccessPolicy` aggregate (`access-principal`)
- Prisma repositories for accounts/sessions/access-principals
- Outbox port backed by Prisma `iam_outbox_events`
- Context-owned SQL migration under `data/postgres/migrations/contexts/identity-access`
