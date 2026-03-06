import { IamDomainError } from '../exceptions/iam-domain.error';

export type TenantType = 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';

export class TenantRef {
  private constructor(
    public readonly tenantType: TenantType,
    public readonly tenantId: string
  ) {}

  static create(input: { tenantType: TenantType; tenantId: string }): TenantRef {
    if (!input.tenantId.trim()) {
      throw new IamDomainError('Tenant id is required.');
    }

    return new TenantRef(input.tenantType, input.tenantId.trim());
  }
}
