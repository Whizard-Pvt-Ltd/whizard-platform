import type { IndustryRole } from '../aggregates/industry-role.aggregate';

export interface IIndustryRoleRepository {
  findByDepartmentId(tenantId: string, departmentId: string): Promise<{
    id: string;
    name: string;
    departmentId: string;
    seniorityLevel?: string;
    reportingTo?: string;
    roleCriticalityScore?: number;
  }[]>;
  findById(id: string): Promise<IndustryRole | null>;
  save(role: IndustryRole): Promise<string>;
  update(role: IndustryRole): Promise<void>;
  delete(id: string): Promise<void>;
}
