import {
  IAM_TOPIC_ACCESS_EVENTS_V1,
  IAM_TOPIC_FEDERATION_EVENTS_V1,
  IAM_TOPIC_PROVISIONING_EVENTS_V1,
  IAM_TOPIC_SESSION_EVENTS_V1,
  IAM_TOPIC_USER_ACCOUNT_EVENTS_V1,
  type IamTopic
} from './iam-topic.constants';

const EXPLICIT_EVENT_TYPE_TO_TOPIC: Readonly<Record<string, IamTopic>> = {
  'iam.user-account-created.v1': IAM_TOPIC_USER_ACCOUNT_EVENTS_V1,
  'iam.user-account-activated.v1': IAM_TOPIC_USER_ACCOUNT_EVENTS_V1,
  'iam.user-email-changed.v1': IAM_TOPIC_USER_ACCOUNT_EVENTS_V1,
  'iam.mfa-enrolled.v1': IAM_TOPIC_USER_ACCOUNT_EVENTS_V1,
  'iam.mfa-factor-revoked.v1': IAM_TOPIC_USER_ACCOUNT_EVENTS_V1,
  'iam.tenant-membership-added.v1': IAM_TOPIC_USER_ACCOUNT_EVENTS_V1,

  'iam.access-principal-created.v1': IAM_TOPIC_ACCESS_EVENTS_V1,
  'iam.role-assigned.v1': IAM_TOPIC_ACCESS_EVENTS_V1,
  'iam.role-revoked.v1': IAM_TOPIC_ACCESS_EVENTS_V1,
  'iam.permission-granted.v1': IAM_TOPIC_ACCESS_EVENTS_V1,
  'iam.permission-revoked.v1': IAM_TOPIC_ACCESS_EVENTS_V1,
  'iam.scope-restriction-added.v1': IAM_TOPIC_ACCESS_EVENTS_V1,
  'iam.scope-restriction-removed.v1': IAM_TOPIC_ACCESS_EVENTS_V1,

  'iam.session-started.v1': IAM_TOPIC_SESSION_EVENTS_V1,
  'iam.session-refreshed.v1': IAM_TOPIC_SESSION_EVENTS_V1,
  'iam.session-expired.v1': IAM_TOPIC_SESSION_EVENTS_V1,
  'iam.session-revoked.v1': IAM_TOPIC_SESSION_EVENTS_V1,
  'iam.concurrent-session-denied.v1': IAM_TOPIC_SESSION_EVENTS_V1,

  'iam.idp-created.v1': IAM_TOPIC_FEDERATION_EVENTS_V1,
  'iam.federated-account-linked.v1': IAM_TOPIC_FEDERATION_EVENTS_V1,
  'iam.federated-login-succeeded.v1': IAM_TOPIC_FEDERATION_EVENTS_V1,
  'iam.federated-login-failed.v1': IAM_TOPIC_FEDERATION_EVENTS_V1,
  'iam.sso-role-mapping-updated.v1': IAM_TOPIC_FEDERATION_EVENTS_V1,

  'iam.access-invited.v1': IAM_TOPIC_PROVISIONING_EVENTS_V1,
  'iam.access-provisioned.v1': IAM_TOPIC_PROVISIONING_EVENTS_V1,
  'iam.access-activated.v1': IAM_TOPIC_PROVISIONING_EVENTS_V1,
  'iam.access-suspended.v1': IAM_TOPIC_PROVISIONING_EVENTS_V1,
  'iam.access-deprovisioned.v1': IAM_TOPIC_PROVISIONING_EVENTS_V1
};

const PREFIX_BASED_ROUTES: ReadonlyArray<readonly [prefix: string, topic: IamTopic]> = [
  ['iam.user-', IAM_TOPIC_USER_ACCOUNT_EVENTS_V1],
  ['iam.session-', IAM_TOPIC_SESSION_EVENTS_V1],
  ['iam.federated-', IAM_TOPIC_FEDERATION_EVENTS_V1],
  ['iam.idp-', IAM_TOPIC_FEDERATION_EVENTS_V1],
  ['iam.sso-', IAM_TOPIC_FEDERATION_EVENTS_V1],
  ['iam.provisioning-', IAM_TOPIC_PROVISIONING_EVENTS_V1],
  ['iam.role-', IAM_TOPIC_ACCESS_EVENTS_V1],
  ['iam.permission-', IAM_TOPIC_ACCESS_EVENTS_V1],
  ['iam.scope-', IAM_TOPIC_ACCESS_EVENTS_V1],
  ['iam.access-principal-', IAM_TOPIC_ACCESS_EVENTS_V1]
] as const;

export const getIamTopicForEventType = (eventType: string): IamTopic | undefined => {
  if (eventType in EXPLICIT_EVENT_TYPE_TO_TOPIC) {
    return EXPLICIT_EVENT_TYPE_TO_TOPIC[eventType];
  }

  const prefixMatch = PREFIX_BASED_ROUTES.find(([prefix]) => eventType.startsWith(prefix));
  return prefixMatch?.[1];
};

export const iamEventTypeToTopicMap: Readonly<Record<string, IamTopic>> = EXPLICIT_EVENT_TYPE_TO_TOPIC;
