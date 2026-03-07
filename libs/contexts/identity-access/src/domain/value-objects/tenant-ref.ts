import { assertNonEmpty, assertOneOf } from './validation.util';

const TENANT_TYPES = ['SYSTEM', 'PARENT_CLUB', 'COLLEGE', 'COMPANY'] as const;
export type TenantType = (typeof TENANT_TYPES)[number];

export class TenantRef {
  private constructor(
    public readonly tenantType: TenantType,
    public readonly tenantId: string
  ) {}

  static from(input: { tenantType: string; tenantId: string }): TenantRef {
    return new TenantRef(
      assertOneOf(input.tenantType, TENANT_TYPES, 'TenantType'),
      assertNonEmpty(input.tenantId, 'TenantId')
    );
  }
}
