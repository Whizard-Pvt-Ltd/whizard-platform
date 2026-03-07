-- IAM remaining tables migration stub
-- Adds write-model tables not included in baseline migration.

create table if not exists iam_credentials (
  id text primary key,
  user_account_id text not null references iam_user_accounts(id) on delete restrict,
  password_hash text not null,
  hash_algo text not null,
  status text not null,
  failed_attempts integer not null default 0,
  locked_until timestamptz null,
  password_changed_at timestamptz not null default now(),
  constraint chk_iam_credentials_status check (status in ('ACTIVE', 'DISABLED'))
);

create table if not exists iam_mfa_enrollments (
  id text primary key,
  user_account_id text not null references iam_user_accounts(id) on delete restrict,
  factor_type text not null,
  secret_ref text not null,
  status text not null,
  enrolled_at timestamptz not null default now(),
  last_used_at timestamptz null,
  constraint chk_iam_mfa_enrollments_status check (status in ('ACTIVE', 'REVOKED'))
);

create table if not exists iam_tenant_memberships (
  id text primary key,
  user_account_id text not null references iam_user_accounts(id) on delete restrict,
  tenant_type text not null,
  tenant_id text not null,
  status text not null,
  joined_at timestamptz not null default now(),
  revoked_at timestamptz null,
  constraint chk_iam_tenant_memberships_status check (status in ('ACTIVE', 'REVOKED'))
);

create table if not exists iam_actor_links (
  id text primary key,
  user_account_id text not null references iam_user_accounts(id) on delete restrict,
  actor_type text not null,
  actor_entity_id text not null,
  is_primary boolean not null default false,
  linked_at timestamptz not null default now()
);

create table if not exists iam_session_tokens (
  id text primary key,
  session_id text not null references iam_user_sessions(id) on delete restrict,
  token_type text not null,
  token_hash text not null,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  constraint chk_iam_session_tokens_type check (token_type in ('ACCESS', 'REFRESH', 'ONE_TIME'))
);

create table if not exists iam_session_devices (
  id text primary key,
  session_id text not null references iam_user_sessions(id) on delete restrict,
  device_fingerprint text not null,
  user_agent text not null,
  ip_hash text not null,
  last_seen_at timestamptz not null default now()
);

create table if not exists iam_identity_providers (
  id text primary key,
  tenant_type text not null,
  tenant_id text not null,
  protocol_type text not null,
  provider_name text not null,
  config_json jsonb not null,
  status text not null,
  constraint chk_iam_identity_providers_status check (status in ('ACTIVE', 'DISABLED'))
);

create table if not exists iam_federated_accounts (
  id text primary key,
  user_account_id text not null references iam_user_accounts(id) on delete restrict,
  identity_provider_id text not null references iam_identity_providers(id) on delete restrict,
  external_subject_id text not null,
  status text not null,
  linked_at timestamptz not null default now(),
  constraint uq_iam_federated_accounts_provider_subject unique (identity_provider_id, external_subject_id)
);

create table if not exists iam_sso_role_mapping_rules (
  id text primary key,
  identity_provider_id text not null references iam_identity_providers(id) on delete restrict,
  claim_name text not null,
  claim_match text not null,
  mapped_role_code text not null,
  target_scope text not null,
  priority integer not null default 100
);

create table if not exists iam_external_identifier_bindings (
  id text primary key,
  identity_provider_id text not null references iam_identity_providers(id) on delete restrict,
  external_identifier text not null,
  user_account_id text not null references iam_user_accounts(id) on delete restrict,
  actor_type text not null,
  actor_entity_id text not null,
  constraint uq_iam_external_identifier_bindings unique (identity_provider_id, external_identifier)
);

create table if not exists iam_provisioned_access (
  id text primary key,
  user_account_id text not null references iam_user_accounts(id) on delete restrict,
  tenant_type text not null,
  tenant_id text not null,
  provisioning_mode text not null,
  lifecycle_status text not null,
  created_at timestamptz not null default now(),
  activated_at timestamptz null,
  deprovisioned_at timestamptz null,
  constraint chk_iam_provisioned_access_status check (lifecycle_status in ('INVITED', 'ACTIVE', 'SUSPENDED', 'DEPROVISIONED'))
);

create table if not exists iam_invitations (
  id text primary key,
  provisioned_access_id text not null references iam_provisioned_access(id) on delete restrict,
  invited_by text not null,
  invitee_email text not null,
  token_hash text not null,
  status text not null,
  expires_at timestamptz not null,
  accepted_at timestamptz null,
  constraint chk_iam_invitations_status check (status in ('PENDING', 'ACCEPTED', 'EXPIRED'))
);

create table if not exists iam_provisioning_events (
  id text primary key,
  provisioned_access_id text not null references iam_provisioned_access(id) on delete restrict,
  event_type text not null,
  event_source text not null,
  payload_json jsonb not null,
  occurred_at timestamptz not null default now(),
  processed_at timestamptz null,
  outcome text not null,
  constraint chk_iam_provisioning_events_outcome check (outcome in ('SUCCESS', 'FAILED'))
);

create index if not exists idx_iam_credentials_user on iam_credentials(user_account_id);
create index if not exists idx_iam_mfa_user on iam_mfa_enrollments(user_account_id);
create index if not exists idx_iam_memberships_user on iam_tenant_memberships(user_account_id);
create index if not exists idx_iam_actor_links_user on iam_actor_links(user_account_id);
create index if not exists idx_iam_tokens_session on iam_session_tokens(session_id);
create index if not exists idx_iam_devices_session on iam_session_devices(session_id);
create index if not exists idx_iam_idp_tenant on iam_identity_providers(tenant_type, tenant_id);
create index if not exists idx_iam_federated_user on iam_federated_accounts(user_account_id);
create index if not exists idx_iam_sso_mapping_provider on iam_sso_role_mapping_rules(identity_provider_id, priority);
create index if not exists idx_iam_binding_user on iam_external_identifier_bindings(user_account_id);
create index if not exists idx_iam_provisioned_access_user on iam_provisioned_access(user_account_id);
create index if not exists idx_iam_invitations_pending on iam_invitations(provisioned_access_id) where status = 'PENDING';
create index if not exists idx_iam_provisioning_events_access on iam_provisioning_events(provisioned_access_id, occurred_at desc);
