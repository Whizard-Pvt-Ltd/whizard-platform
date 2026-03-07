import type { AuthenticateWithPasswordRequestDto } from '../dto/requests/authenticate-with-password.request.dto';

export interface AuthenticateWithPasswordCommand {
  readonly request: AuthenticateWithPasswordRequestDto;
}
