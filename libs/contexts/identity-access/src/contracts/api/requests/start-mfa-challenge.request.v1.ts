import type { MfaFactorType } from '../shared/transport-enums';

export interface StartMfaChallengeRequestV1 {
  userAccountId: string;
  factorType: MfaFactorType;
}
