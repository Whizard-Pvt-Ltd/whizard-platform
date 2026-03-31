import type { AccessPrincipalRepository } from '../../../../application/ports/repositories/access-principal.repository';
import { AccessPrincipal } from '../../../../domain/aggregates/access-policy/access-principal.aggregate';

export class PrismaAccessPrincipalRepository implements AccessPrincipalRepository {
  async findById(_id: string): Promise<AccessPrincipal | null> {
    return null;
  }

  async findByUserAndTenant(_input: {
    userAccountId: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
  }): Promise<AccessPrincipal | null> {
    return null;
  }

  async save(_accessPrincipal: AccessPrincipal): Promise<void> {
    // no-op: accessPrincipal table removed from schema
  }
}
