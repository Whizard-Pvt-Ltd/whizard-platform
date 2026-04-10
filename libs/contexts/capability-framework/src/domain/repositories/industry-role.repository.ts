import type { IndustryRole } from '../aggregates/industry-role.aggregate';

export interface IIndustryRoleRepository {
  findByDepartmentId(departmentId: string, tenantId?: string): Promise<{
    id: string;
    name: string;
    departmentId: string;
    seniorityLevel?: string;
    reportingTo?: string;
    roleCriticalityScore?: number;
  }[]>;
  findByDepartmentWithTenants(departmentId: string, tenantIds: string[], ownedTenantIds: string[]): Promise<{
    id: string;
    name: string;
    tenantId: string;
    departmentId: string;
    description?: string;
    canEdit: boolean;
  }[]>;
  findById(id: string): Promise<IndustryRole | null>;
  save(role: IndustryRole): Promise<{ id: string }>;
  update(role: IndustryRole): Promise<void>;
  delete(id: string): Promise<void>;
}
