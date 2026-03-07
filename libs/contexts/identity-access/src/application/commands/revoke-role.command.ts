import type { RevokeRoleRequestDto } from '../dto/requests/revoke-role.request.dto';

export interface RevokeRoleCommand {
  readonly request: RevokeRoleRequestDto;
}
