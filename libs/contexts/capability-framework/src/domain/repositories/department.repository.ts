import type { Department } from '../aggregates/department.aggregate';

export interface IDepartmentRepository {
  findByTenantId(tenantId: string, industryId?: string): Promise<{
    id: string;
    name: string;
    industryId?: string;
    functionalGroupIds: string[];
    operationalCriticalityScore?: number;
    revenueContributionWeight?: number;
    regulatoryExposureLevel?: number;
  }[]>;
  findById(id: string): Promise<Department | null>;
  save(dept: Department, fgIds: string[]): Promise<void>;
  update(dept: Department, fgIds: string[]): Promise<void>;
  delete(id: string): Promise<void>;
}
