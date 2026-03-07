import type { VerifyMfaChallengeRequestDto } from '../dto/requests/verify-mfa-challenge.request.dto';

export interface VerifyMfaChallengeCommand {
  readonly request: VerifyMfaChallengeRequestDto;
}
