import type { RevokePermissionRequestDto } from '../dto/requests/revoke-permission.request.dto';

export interface RevokePermissionCommand {
  readonly request: RevokePermissionRequestDto;
}
