import type { RefreshSessionRequestDto } from '../dto/requests/refresh-session.request.dto';

export interface RefreshSessionCommand {
  readonly request: RefreshSessionRequestDto;
}
