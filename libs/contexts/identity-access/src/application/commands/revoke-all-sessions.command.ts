import type { RevokeAllSessionsRequestDto } from '../dto/requests/revoke-all-sessions.request.dto';

export interface RevokeAllSessionsCommand {
  readonly request: RevokeAllSessionsRequestDto;
}
