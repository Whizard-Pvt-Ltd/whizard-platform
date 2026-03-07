import type { SyncExternalIdentifierRequestDto } from '../dto/requests/sync-external-identifier.request.dto';

export interface SyncExternalIdentifierCommand {
  readonly request: SyncExternalIdentifierRequestDto;
}
