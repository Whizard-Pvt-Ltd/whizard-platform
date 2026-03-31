export interface CreateDepartmentCommand {
  tenantId: string;
  industryId?: string;
  name: string;
  functionalGroupIds: string[];
  operationalCriticalityScore?: number;
  revenueContributionWeight?: number;
  regulatoryExposureLevel?: number;
}

export interface UpdateDepartmentCommand {
  id: string;
  tenantId: string;
  name?: string;
  functionalGroupIds?: string[];
  operationalCriticalityScore?: number;
  revenueContributionWeight?: number;
  regulatoryExposureLevel?: number;
}

export interface DeleteDepartmentCommand {
  id: string;
  tenantId: string;
}
