import type { UpdateSsoRoleMappingRequestDto } from '../dto/requests/update-sso-role-mapping.request.dto';

export interface UpdateSsoRoleMappingCommand {
  readonly request: UpdateSsoRoleMappingRequestDto;
}
