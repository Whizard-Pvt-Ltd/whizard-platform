import type { UpdateIdentityProviderRequestDto } from '../dto/requests/update-identity-provider.request.dto';

export interface UpdateIdentityProviderCommand {
  readonly request: UpdateIdentityProviderRequestDto;
}
