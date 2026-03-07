import type { AddScopeRestrictionRequestDto } from '../dto/requests/add-scope-restriction.request.dto';

export interface AddScopeRestrictionCommand {
  readonly request: AddScopeRestrictionRequestDto;
}
