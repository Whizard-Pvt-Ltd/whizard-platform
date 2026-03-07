import type { InviteUserToTenantRequestDto } from '../dto/requests/invite-user-to-tenant.request.dto';

export interface InviteUserToTenantCommand {
  readonly request: InviteUserToTenantRequestDto;
}
