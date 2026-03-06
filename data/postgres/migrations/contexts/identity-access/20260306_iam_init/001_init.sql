-- IAM initial schema (identity-access bounded context)
-- Date: 2026-03-06

create table if not exists iam_user_accounts (
  id text primary key,
  primary_login_id text not null unique,
  primary_email text not null unique,
  auth_mode text not null,
  status text not null,
  mfa_required boolean not null default true,
  tenant_type text not null,
  tenant_id text not null,
  created_at timestamptz not null default now(),
  activated_at timestamptz null,
  last_login_at timestamptz null,
  version integer not null default 1,
  constraint chk_iam_user_accounts_status
    check (status in ('PENDING', 'ACTIVE', 'SUSPENDED')),
  constraint chk_iam_user_accounts_tenant_type
    check (tenant_type in ('SYSTEM', 'PARENT_CLUB', 'COLLEGE', 'COMPANY'))
);

create table if not exists iam_access_principals (
  id text primary key,
  user_account_id text not null,
  tenant_type text not null,
  tenant_id text not null,
  status text not null,
  created_at timestamptz not null default now(),
  version integer not null default 1,
  constraint fk_iam_access_principals_user
    foreign key (user_account_id) references iam_user_accounts(id) on delete restrict,
  constraint uq_iam_access_principal_scope
    unique (user_account_id, tenant_type, tenant_id),
  constraint chk_iam_access_principal_tenant_type
    check (tenant_type in ('SYSTEM', 'PARENT_CLUB', 'COLLEGE', 'COMPANY')),
  constraint chk_iam_access_principal_status
    check (status in ('ACTIVE', 'SUSPENDED'))
);

create table if not exists iam_role_assignments (
  id text primary key,
  access_principal_id text not null,
  role_code text not null,
  assigned_by text not null,
  assigned_at timestamptz not null default now(),
  valid_from timestamptz null,
  valid_to timestamptz null,
  status text not null,
  constraint fk_iam_role_assignments_principal
    foreign key (access_principal_id) references iam_access_principals(id) on delete restrict,
  constraint chk_iam_role_assignments_status
    check (status in ('ACTIVE', 'REVOKED'))
);

create table if not exists iam_permission_grants (
  id text primary key,
  access_principal_id text not null,
  permission_code text not null,
  grant_source text not null,
  scope_type text null,
  scope_value text null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz null,
  constraint fk_iam_permission_grants_principal
    foreign key (access_principal_id) references iam_access_principals(id) on delete restrict
);

create table if not exists iam_scope_restrictions (
  id text primary key,
  access_principal_id text not null,
  resource_type text not null,
  restriction_type text not null,
  scope_expression text not null,
  created_at timestamptz not null default now(),
  constraint fk_iam_scope_restrictions_principal
    foreign key (access_principal_id) references iam_access_principals(id) on delete restrict
);

create table if not exists iam_user_sessions (
  id text primary key,
  user_account_id text not null,
  status text not null,
  issued_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  client_context text not null,
  constraint fk_iam_user_sessions_user
    foreign key (user_account_id) references iam_user_accounts(id) on delete restrict,
  constraint chk_iam_user_sessions_status
    check (status in ('ACTIVE', 'REVOKED', 'EXPIRED'))
);

create table if not exists iam_outbox_events (
  id text primary key,
  aggregate_type text not null,
  aggregate_id text not null,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'PENDING',
  occurred_at timestamptz not null default now(),
  published_at timestamptz null,
  constraint chk_iam_outbox_status
    check (status in ('PENDING', 'PUBLISHED', 'FAILED'))
);

create index if not exists idx_iam_user_accounts_tenant on iam_user_accounts(tenant_type, tenant_id);
create index if not exists idx_iam_access_principals_tenant on iam_access_principals(tenant_type, tenant_id, status);
create index if not exists idx_iam_role_assignments_active on iam_role_assignments(access_principal_id) where status = 'ACTIVE';
create index if not exists idx_iam_permission_grants_active on iam_permission_grants(access_principal_id, permission_code) where revoked_at is null;
create index if not exists idx_iam_sessions_active on iam_user_sessions(user_account_id) where status = 'ACTIVE';
create index if not exists idx_iam_outbox_dispatch on iam_outbox_events(status, occurred_at) where status = 'PENDING';
