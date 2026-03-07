import { DomainEvent } from '../../events/domain-event';
import type { ExternalIdentifierBinding } from './entities/external-identifier-binding.entity';
import type { IdentityProvider } from './entities/identity-provider.entity';
import type { SsoRoleMappingRule } from './entities/sso-role-mapping-rule.entity';

interface FederatedAccountState {
  id: string;
  userAccountId: string;
  identityProviderId: string;
  externalSubjectId: string;
  status: 'LINKED' | 'DISABLED';
  linkedAt: Date;
  provider: IdentityProvider | null;
  mappings: SsoRoleMappingRule[];
  bindings: ExternalIdentifierBinding[];
}

export class FederatedAccount {
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private readonly state: FederatedAccountState) {}

  static link(input: {
    id: string;
    userAccountId: string;
    identityProviderId: string;
    externalSubjectId: string;
    now?: Date;
  }): FederatedAccount {
    const now = input.now ?? new Date();
    const account = new FederatedAccount({
      id: input.id,
      userAccountId: input.userAccountId,
      identityProviderId: input.identityProviderId,
      externalSubjectId: input.externalSubjectId,
      status: 'LINKED',
      linkedAt: now,
      provider: null,
      mappings: [],
      bindings: []
    });

    account.raise({
      type: 'iam.federated-account-linked.v1',
      occurredAt: now,
      payload: {
        federatedAccountId: account.state.id,
        userAccountId: account.state.userAccountId,
        identityProviderId: account.state.identityProviderId
      }
    });

    return account;
  }

  setIdentityProvider(provider: IdentityProvider, now: Date = new Date()): void {
    this.state.provider = provider;

    this.raise({
      type: 'iam.idp-created.v1',
      occurredAt: now,
      payload: {
        identityProviderId: provider.providerId,
        protocolType: provider.protocolType,
        tenantType: provider.tenantType,
        tenantId: provider.tenantId
      }
    });
  }

  markFederatedLoginSucceeded(now: Date = new Date()): void {
    this.raise({
      type: 'iam.federated-login-succeeded.v1',
      occurredAt: now,
      payload: {
        federatedAccountId: this.state.id,
        userAccountId: this.state.userAccountId
      }
    });
  }

  markFederatedLoginFailed(reason: string, now: Date = new Date()): void {
    this.raise({
      type: 'iam.federated-login-failed.v1',
      occurredAt: now,
      payload: {
        federatedAccountId: this.state.id,
        userAccountId: this.state.userAccountId,
        reason
      }
    });
  }

  updateSsoRoleMapping(rules: SsoRoleMappingRule[], now: Date = new Date()): void {
    this.state.mappings = [...rules];

    this.raise({
      type: 'iam.sso-role-mapping-updated.v1',
      occurredAt: now,
      payload: {
        federatedAccountId: this.state.id,
        ruleCount: rules.length
      }
    });
  }

  addExternalBinding(binding: ExternalIdentifierBinding): void {
    this.state.bindings.push(binding);
  }

  pullDomainEvents(): DomainEvent[] {
    const out = [...this.domainEvents];
    this.domainEvents.length = 0;
    return out;
  }

  private raise(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
