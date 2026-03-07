import type { AuthorizationGateway } from '../../application/ports/gateways/authorization.gateway';

export interface AuthorizationRule {
  readonly actorUserAccountId: string;
  readonly tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
  readonly tenantId: string;
  readonly permissionCode: string;
}

export interface StaticAuthorizationConfig {
  readonly rules: readonly AuthorizationRule[];
}

export class StaticAuthorizationGateway implements AuthorizationGateway {
  constructor(private readonly config: StaticAuthorizationConfig = { rules: [] }) {}

  async assertCan(input: {
    actorUserAccountId: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
    permissionCode: string;
  }): Promise<void> {
    const allowed = this.config.rules.some((rule) => {
      return (
        rule.actorUserAccountId === input.actorUserAccountId &&
        rule.tenantType === input.tenantType &&
        rule.tenantId === input.tenantId &&
        rule.permissionCode === input.permissionCode
      );
    });

    if (!allowed) {
      throw new Error('Authorization denied by static IAM gateway.');
    }
  }
}
