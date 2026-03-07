import type { IamAccessEventPayloadByTypeV1 } from './iam-access-events.v1';
import type { IamFederationEventPayloadByTypeV1 } from './iam-federation-events.v1';
import type { IamProvisioningEventPayloadByTypeV1 } from './iam-provisioning-events.v1';
import type { IamSessionEventPayloadByTypeV1 } from './iam-session-events.v1';
import type { IamUserAccountEventPayloadByTypeV1 } from './iam-user-account-events.v1';

export type IamEventPayloadByTypeV1 = IamUserAccountEventPayloadByTypeV1 &
  IamAccessEventPayloadByTypeV1 &
  IamSessionEventPayloadByTypeV1 &
  IamFederationEventPayloadByTypeV1 &
  IamProvisioningEventPayloadByTypeV1;

export type IamEventTypeV1 = keyof IamEventPayloadByTypeV1;
