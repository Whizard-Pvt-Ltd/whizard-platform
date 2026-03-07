import type { LogoutSessionRequestDto } from '../dto/requests/logout-session.request.dto';

export interface LogoutSessionCommand {
  readonly request: LogoutSessionRequestDto;
}
