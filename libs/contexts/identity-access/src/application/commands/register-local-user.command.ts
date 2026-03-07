import type { RegisterLocalUserRequestDto } from '../dto/requests/register-local-user.request.dto';

export interface RegisterLocalUserCommand {
  readonly request: RegisterLocalUserRequestDto;
}
