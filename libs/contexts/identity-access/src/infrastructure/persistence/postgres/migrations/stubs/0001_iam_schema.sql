-- IAM schema bootstrap stub
-- Target: PostgreSQL 14+
-- Notes:
-- 1) Uses explicit UUID primary keys.
-- 2) Preserves history (no cascade delete).
-- 3) Includes outbox table for append-only event publication.

create schema if not exists iam;

create table if not exists iam.user_accounts (
  id uuid primary key,
  primary_login_id text not null,
  primary_email text not null,
  auth_mode text not null,
  status text not null,
  mfa_required boolean not null default true,
  tenant_type text not null,
  tenant_id uuid not null,
  created_at timestamptz not null default now(),
  activated_at timestamptz null,
  last_login_at timestamptz null,
  version integer not null default 1,
  constraint ck_user_accounts_status check (status in ('PENDING', 'ACTIVE', 'SUSPENDED', 'DEPROVISIONED'))
);

create unique index if not exists ux_user_accounts_primary_login_id on iam.user_accounts (primary_login_id);
create unique index if not exists ux_user_accounts_primary_email on iam.user_accounts (primary_email);
create index if not exists ix_user_accounts_tenant on iam.user_accounts (tenant_type, tenant_id);
create index if not exists ix_user_accounts_status on iam.user_accounts (status);

create table if not exists iam.credentials (
  id uuid primary key,
  user_account_id uuid not null references iam.user_accounts(id) on delete restrict,
  credential_type text not null,
  password_hash text not null,
  password_algo text not null,
  password_changed_at timestamptz not null,
  must_rotate boolean not null default false,
  disabled_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint ck_credentials_type check (credential_type in ('LOCAL_PASSWORD', 'FEDERATED', 'PASSKEY'))
);

create index if not exists ix_credentials_user_account_id on iam.credentials (user_account_id);
create index if not exists ix_credentials_active_by_user on iam.credentials (user_account_id) where disabled_at is null;

create table if not exists iam.mfa_enrollments (
  id uuid primary key,
  user_account_id uuid not null references iam.user_accounts(id) on delete restrict,
  factor_type text not null,
  secret_ref text not null,
  status text not null,
  enrolled_at timestamptz not null,
  revoked_at timestamptz null,
  constraint ck_mfa_status check (status in ('ACTIVE', 'REVOKED'))
);

create index if not exists ix_mfa_enrollments_user_account_id on iam.mfa_enrollments (user_account_id);
create index if not exists ix_mfa_enrollments_active on iam.mfa_enrollments (user_account_id, factor_type) where status = 'ACTIVE';

create table if not exists iam.tenant_memberships (
  id uuid primary key,
  user_account_id uuid not null references iam.user_accounts(id) on delete restrict,
  tenant_type text not null,
  tenant_id uuid not null,
  status text not null,
  joined_at timestamptz not null,
  revoked_at timestamptz null,
  constraint ck_tenant_membership_status check (status in ('ACTIVE', 'REVOKED'))
);

create unique index if not exists ux_tenant_memberships_active on iam.tenant_memberships (user_account_id, tenant_type, tenant_id) where status = 'ACTIVE';

create table if not exists iam.actor_links (
  id uuid primary key,
  user_account_id uuid not null references iam.user_accounts(id) on delete restrict,
  actor_type text not null,
  actor_entity_id uuid not null,
  is_primary boolean not null default false,
  linked_at timestamptz not null,
  unlinked_at timestamptz null
);

create index if not exists ix_actor_links_user_account_id on iam.actor_links (user_account_id);

create table if not exists iam.access_principals (
  id uuid primary key,
  user_account_id uuid not null references iam.user_accounts(id) on delete restrict,
  tenant_type text not null,
  tenant_id uuid not null,
  status text not null,
  created_at timestamptz not null default now(),
  version integer not null default 1,
  constraint ck_access_principals_status check (status in ('ACTIVE', 'SUSPENDED'))
);

create unique index if not exists ux_access_principals_user_tenant on iam.access_principals (user_account_id, tenant_type, tenant_id);
create index if not exists ix_access_principals_tenant on iam.access_principals (tenant_type, tenant_id, status);

create table if not exists iam.role_assignments (
  id uuid primary key,
  access_principal_id uuid not null references iam.access_principals(id) on delete restrict,
  role_code text not null,
  assigned_by uuid not null,
  assigned_at timestamptz not null,
  valid_from timestamptz null,
  valid_to timestamptz null,
  status text not null,
  constraint ck_role_assignments_status check (status in ('ACTIVE', 'REVOKED')),
  constraint ck_role_assignments_window check (valid_to is null or valid_from is null or valid_to >= valid_from)
);

create index if not exists ix_role_assignments_principal on iam.role_assignments (access_principal_id, status);
create index if not exists ix_role_assignments_role_code on iam.role_assignments (role_code);

create table if not exists iam.permission_grants (
  id uuid primary key,
  access_principal_id uuid not null references iam.access_principals(id) on delete restrict,
  permission_code text not null,
  grant_source text not null,
  scope_type text null,
  scope_value text null,
  granted_at timestamptz not null,
  revoked_at timestamptz null,
  constraint ck_permission_grants_scope_pair check ((scope_type is null and scope_value is null) or (scope_type is not null and scope_value is not null))
);

create index if not exists ix_permission_grants_principal_perm on iam.permission_grants (access_principal_id, permission_code);
create index if not exists ix_permission_grants_active on iam.permission_grants (permission_code, access_principal_id) where revoked_at is null;

create table if not exists iam.scope_restrictions (
  id uuid primary key,
  access_principal_id uuid not null references iam.access_principals(id) on delete restrict,
  resource_type text not null,
  restriction_type text not null,
  scope_expression text not null,
  created_at timestamptz not null
);

create index if not exists ix_scope_restrictions_principal_resource on iam.scope_restrictions (access_principal_id, resource_type);

create table if not exists iam.user_sessions (
  id uuid primary key,
  user_account_id uuid not null references iam.user_accounts(id) on delete restrict,
  status text not null,
  issued_at timestamptz not null,
  last_activity_at timestamptz not null,
  expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  client_context jsonb not null,
  revoked_at timestamptz null,
  revoked_reason text null,
  constraint ck_user_sessions_status check (status in ('ACTIVE', 'REVOKED', 'EXPIRED'))
);

create index if not exists ix_user_sessions_user_status on iam.user_sessions (user_account_id, status);
create index if not exists ix_user_sessions_expires_at on iam.user_sessions (expires_at);
create index if not exists ix_user_sessions_active_only on iam.user_sessions (user_account_id, issued_at desc) where status = 'ACTIVE';

create table if not exists iam.session_tokens (
  id uuid primary key,
  session_id uuid not null references iam.user_sessions(id) on delete restrict,
  token_type text not null,
  token_hash text not null,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  constraint ck_session_tokens_type check (token_type in ('ACCESS', 'REFRESH'))
);

create unique index if not exists ux_session_tokens_hash on iam.session_tokens (token_hash);
create index if not exists ix_session_tokens_session_id on iam.session_tokens (session_id);

create table if not exists iam.session_devices (
  id uuid primary key,
  session_id uuid not null references iam.user_sessions(id) on delete restrict,
  device_fingerprint text not null,
  device_name text null,
  ip_address text null,
  user_agent text null,
  trusted boolean not null default false,
  created_at timestamptz not null
);

create unique index if not exists ux_session_devices_fingerprint on iam.session_devices (session_id, device_fingerprint);

create table if not exists iam.identity_providers (
  id uuid primary key,
  tenant_type text not null,
  tenant_id uuid not null,
  protocol_type text not null,
  provider_name text not null,
  config_json jsonb not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_identity_providers_status check (status in ('ACTIVE', 'DISABLED')),
  constraint ck_identity_providers_protocol check (protocol_type in ('OIDC', 'SAML2', 'OAUTH2'))
);

create unique index if not exists ux_identity_providers_tenant_name on iam.identity_providers (tenant_type, tenant_id, provider_name);
create index if not exists ix_identity_providers_active on iam.identity_providers (tenant_type, tenant_id) where status = 'ACTIVE';

create table if not exists iam.federated_accounts (
  id uuid primary key,
  user_account_id uuid not null references iam.user_accounts(id) on delete restrict,
  identity_provider_id uuid not null references iam.identity_providers(id) on delete restrict,
  external_subject_id text not null,
  status text not null,
  linked_at timestamptz not null,
  disabled_at timestamptz null,
  constraint ck_federated_accounts_status check (status in ('LINKED', 'DISABLED'))
);

create unique index if not exists ux_federated_accounts_provider_subject on iam.federated_accounts (identity_provider_id, external_subject_id);
create index if not exists ix_federated_accounts_user on iam.federated_accounts (user_account_id);

create table if not exists iam.sso_role_mapping_rules (
  id uuid primary key,
  identity_provider_id uuid not null references iam.identity_providers(id) on delete restrict,
  rule_name text not null,
  mapping_expression text not null,
  target_role_code text not null,
  priority integer not null,
  status text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint ck_sso_mapping_status check (status in ('ACTIVE', 'DISABLED'))
);

create unique index if not exists ux_sso_mapping_rules_provider_name on iam.sso_role_mapping_rules (identity_provider_id, rule_name);
create index if not exists ix_sso_mapping_rules_provider_priority on iam.sso_role_mapping_rules (identity_provider_id, priority);

create table if not exists iam.external_identifier_bindings (
  id uuid primary key,
  federated_account_id uuid not null references iam.federated_accounts(id) on delete restrict,
  identifier_type text not null,
  identifier_value text not null,
  source_system text not null,
  synced_at timestamptz not null,
  status text not null,
  constraint ck_external_identifier_status check (status in ('ACTIVE', 'REVOKED'))
);

create unique index if not exists ux_external_identifier_bindings_source_identifier on iam.external_identifier_bindings (source_system, identifier_type, identifier_value);
create index if not exists ix_external_identifier_bindings_federated_account on iam.external_identifier_bindings (federated_account_id);

create table if not exists iam.provisioned_access (
  id uuid primary key,
  user_account_id uuid not null references iam.user_accounts(id) on delete restrict,
  tenant_type text not null,
  tenant_id uuid not null,
  provisioning_mode text not null,
  lifecycle_status text not null,
  created_at timestamptz not null,
  activated_at timestamptz null,
  deprovisioned_at timestamptz null,
  constraint ck_provisioned_access_status check (lifecycle_status in ('INVITED', 'ACTIVE', 'SUSPENDED', 'DEPROVISIONED'))
);

create unique index if not exists ux_provisioned_access_user_tenant on iam.provisioned_access (user_account_id, tenant_type, tenant_id);
create index if not exists ix_provisioned_access_status on iam.provisioned_access (lifecycle_status);

create table if not exists iam.invitations (
  id uuid primary key,
  provisioned_access_id uuid not null references iam.provisioned_access(id) on delete restrict,
  invitee_email text not null,
  invitation_token_hash text not null,
  sent_by uuid not null,
  sent_at timestamptz not null,
  expires_at timestamptz not null,
  accepted_at timestamptz null,
  revoked_at timestamptz null
);

create unique index if not exists ux_invitations_token_hash on iam.invitations (invitation_token_hash);
create index if not exists ix_invitations_pending on iam.invitations (provisioned_access_id, expires_at) where accepted_at is null and revoked_at is null;

create table if not exists iam.provisioning_events (
  id uuid primary key,
  provisioned_access_id uuid not null references iam.provisioned_access(id) on delete restrict,
  event_type text not null,
  event_source text not null,
  metadata jsonb not null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now()
);

create index if not exists ix_provisioning_events_access_occurred on iam.provisioning_events (provisioned_access_id, occurred_at desc);

create table if not exists iam.outbox_events (
  id uuid primary key,
  aggregate_type text not null,
  aggregate_id text not null,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'PENDING',
  occurred_at timestamptz not null,
  published_at timestamptz null,
  failed_at timestamptz null,
  retry_count integer not null default 0,
  error_message text null,
  created_at timestamptz not null default now(),
  constraint ck_outbox_status check (status in ('PENDING', 'PUBLISHED', 'FAILED'))
);

create index if not exists ix_outbox_pending on iam.outbox_events (status, occurred_at) where status = 'PENDING';
create index if not exists ix_outbox_event_type_published on iam.outbox_events (event_type, published_at);
