import type { AssignRoleRequestDto } from '../dto/requests/assign-role.request.dto';

export interface AssignRoleCommand {
  readonly request: AssignRoleRequestDto;
}
