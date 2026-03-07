import type { RemoveScopeRestrictionRequestDto } from '../dto/requests/remove-scope-restriction.request.dto';

export interface RemoveScopeRestrictionCommand {
  readonly request: RemoveScopeRestrictionRequestDto;
}
