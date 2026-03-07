import type { ProvisionAccessFromSSORequestDto } from '../dto/requests/provision-access-from-sso.request.dto';

export interface ProvisionAccessFromSSOCommand {
  readonly request: ProvisionAccessFromSSORequestDto;
}
