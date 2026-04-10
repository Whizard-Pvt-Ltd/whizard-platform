import type { Department } from '../aggregates/department.aggregate';

export interface IDepartmentRepository {
  findByTenantId(tenantId: string, industryId?: string, scopeToTenant?: boolean): Promise<{
    id: string;
    name: string;
    industryId?: string;
    functionalGroupIds: string[];
    operationalCriticalityScore?: number;
    revenueContributionWeight?: number;
    regulatoryExposureLevel?: number;
  }[]>;
  findByTenantIds(tenantIds: string[], ownedTenantIds: string[], industryId?: string): Promise<{
    id: string;
    name: string;
    tenantId: string;
    industryId?: string;
    functionalGroupIds: string[];
    operationalCriticalityScore?: number;
    revenueContributionWeight?: number;
    regulatoryExposureLevel?: number;
    canEdit: boolean;
  }[]>;
  findById(id: string): Promise<Department | null>;
  save(dept: Department, fgIds: string[]): Promise<{ id: string }>;
  update(dept: Department, fgIds: string[]): Promise<void>;
  delete(id: string): Promise<void>;
}
