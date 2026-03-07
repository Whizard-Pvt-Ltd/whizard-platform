import type { SuspendProvisionedAccessRequestDto } from '../dto/requests/suspend-provisioned-access.request.dto';

export interface SuspendProvisionedAccessCommand {
  readonly request: SuspendProvisionedAccessRequestDto;
}
