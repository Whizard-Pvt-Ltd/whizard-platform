import type { IDepartmentRepository } from '../../domain/repositories/department.repository';

export class ListDepartmentsQueryHandler {
  constructor(private readonly repo: IDepartmentRepository) {}

  async execute(tenantIds: string[], ownedTenantIds: string[], industryId?: string): Promise<{
    id: string;
    name: string;
    tenantId: string;
    industryId?: string;
    functionalGroupIds: string[];
    operationalCriticalityScore?: number;
    revenueContributionWeight?: number;
    regulatoryExposureLevel?: number;
    canEdit: boolean;
  }[]> {
    return this.repo.findByTenantIds(tenantIds, ownedTenantIds, industryId);
  }
}
