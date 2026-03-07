import type { AccessPrincipalRepository } from './access-principal.repository';
import type { CredentialRepository } from './credential.repository';
import type { FederatedAccountRepository } from './federated-account.repository';
import type { IdentityProviderRepository } from './identity-provider.repository';
import type { InvitationRepository } from './invitation.repository';
import type { ProvisionedAccessRepository } from './provisioned-access.repository';
import type { UserAccountRepository } from './user-account.repository';
import type { UserSessionRepository } from './user-session.repository';

export interface IamCommandRepositories {
  readonly userAccounts: UserAccountRepository;
  readonly credentials: CredentialRepository;
  readonly sessions: UserSessionRepository;
  readonly accessPrincipals: AccessPrincipalRepository;
  readonly identityProviders: IdentityProviderRepository;
  readonly federatedAccounts: FederatedAccountRepository;
  readonly provisionedAccess: ProvisionedAccessRepository;
  readonly invitations: InvitationRepository;
}
