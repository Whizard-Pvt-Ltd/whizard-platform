import type { DeprovisionAccessRequestDto } from '../dto/requests/deprovision-access.request.dto';

export interface DeprovisionAccessCommand {
  readonly request: DeprovisionAccessRequestDto;
}
