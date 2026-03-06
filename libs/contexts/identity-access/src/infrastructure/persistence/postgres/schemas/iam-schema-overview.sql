-- Identity and Access persistence ownership
-- This file documents logical table ownership for the context.

-- Aggregates
-- UserIdentity: iam_user_accounts
-- AccessPolicy: iam_access_principals + iam_role_assignments + iam_permission_grants + iam_scope_restrictions
-- UserSession: iam_user_sessions
-- Reliability: iam_outbox_events
