import type { StartMfaChallengeRequestDto } from '../dto/requests/start-mfa-challenge.request.dto';

export interface StartMfaChallengeCommand {
  readonly request: StartMfaChallengeRequestDto;
}
