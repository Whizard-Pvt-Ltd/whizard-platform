import type { GrantPermissionRequestDto } from '../dto/requests/grant-permission.request.dto';

export interface GrantPermissionCommand {
  readonly request: GrantPermissionRequestDto;
}
