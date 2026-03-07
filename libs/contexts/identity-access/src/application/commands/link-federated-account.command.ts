import type { LinkFederatedAccountRequestDto } from '../dto/requests/link-federated-account.request.dto';

export interface LinkFederatedAccountCommand {
  readonly request: LinkFederatedAccountRequestDto;
}
