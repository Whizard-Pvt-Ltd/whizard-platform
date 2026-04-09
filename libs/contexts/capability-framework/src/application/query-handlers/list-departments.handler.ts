import type { IDepartmentRepository } from '../../domain/repositories/department.repository';

export class ListDepartmentsQueryHandler {
  constructor(private readonly repo: IDepartmentRepository) {}

  async execute(tenantId: string, industryId?: string, scopeToTenant = false): Promise<{
    id: string;
    name: string;
    industryId?: string;
    functionalGroupIds: string[];
    operationalCriticalityScore?: number;
    revenueContributionWeight?: number;
    regulatoryExposureLevel?: number;
  }[]> {
    return this.repo.findByTenantId(tenantId, industryId, scopeToTenant);
  }
}
