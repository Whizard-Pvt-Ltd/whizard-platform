import { AccessPrincipal } from '../../../domain';

export interface AccessPrincipalRepository {
  findById(id: string): Promise<AccessPrincipal | null>;
  findByUserAndTenant(input: {
    userAccountId: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
  }): Promise<AccessPrincipal | null>;
  save(accessPrincipal: AccessPrincipal): Promise<void>;
}
