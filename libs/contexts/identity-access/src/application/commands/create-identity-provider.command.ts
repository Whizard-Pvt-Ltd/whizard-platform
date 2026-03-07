import type { CreateIdentityProviderRequestDto } from '../dto/requests/create-identity-provider.request.dto';

export interface CreateIdentityProviderCommand {
  readonly request: CreateIdentityProviderRequestDto;
}
