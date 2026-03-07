export const IAM_TOPIC_USER_ACCOUNT_EVENTS_V1 = 'iam.user-account-events.v1';
export const IAM_TOPIC_ACCESS_EVENTS_V1 = 'iam.access-events.v1';
export const IAM_TOPIC_SESSION_EVENTS_V1 = 'iam.session-events.v1';
export const IAM_TOPIC_FEDERATION_EVENTS_V1 = 'iam.federation-events.v1';
export const IAM_TOPIC_PROVISIONING_EVENTS_V1 = 'iam.provisioning-events.v1';

export const IAM_TOPICS = [
  IAM_TOPIC_USER_ACCOUNT_EVENTS_V1,
  IAM_TOPIC_ACCESS_EVENTS_V1,
  IAM_TOPIC_SESSION_EVENTS_V1,
  IAM_TOPIC_FEDERATION_EVENTS_V1,
  IAM_TOPIC_PROVISIONING_EVENTS_V1
] as const;

export type IamTopic = (typeof IAM_TOPICS)[number];
