import type { ReactivateProvisionedAccessRequestDto } from '../dto/requests/reactivate-provisioned-access.request.dto';

export interface ReactivateProvisionedAccessCommand {
  readonly request: ReactivateProvisionedAccessRequestDto;
}
