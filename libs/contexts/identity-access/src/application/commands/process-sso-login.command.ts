import type { ProcessSsoLoginRequestDto } from '../dto/requests/process-sso-login.request.dto';

export interface ProcessSsoLoginCommand {
  readonly request: ProcessSsoLoginRequestDto;
}
