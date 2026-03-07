-- Identity and Access persistence ownership
-- Table inventory grouped by aggregate root and supporting concerns.

-- UserIdentity aggregate
-- iam.user_accounts
-- iam.credentials
-- iam.mfa_enrollments
-- iam.tenant_memberships
-- iam.actor_links

-- AccessPolicy aggregate
-- iam.access_principals
-- iam.role_assignments
-- iam.permission_grants
-- iam.scope_restrictions

-- UserSession aggregate
-- iam.user_sessions
-- iam.session_tokens
-- iam.session_devices

-- FederatedIdentity aggregate
-- iam.identity_providers
-- iam.federated_accounts
-- iam.sso_role_mapping_rules
-- iam.external_identifier_bindings

-- ProvisioningLifecycle aggregate
-- iam.provisioned_access
-- iam.invitations
-- iam.provisioning_events

-- Reliability / integration
-- iam.outbox_events
