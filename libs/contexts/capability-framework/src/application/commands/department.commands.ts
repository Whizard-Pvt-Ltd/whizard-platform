export interface CreateDepartmentCommand {
  tenantId: string;
  industryId: string;
  name: string;
  fgIds: string[];
  operationalCriticalityScore?: number;
  revenueContributionWeight?: number;
  regulatoryExposureLevel?: number;
  createdBy: string;
}

export interface UpdateDepartmentCommand {
  id: string;
  tenantId: string;
  name?: string;
  fgIds?: string[];
  operationalCriticalityScore?: number;
  revenueContributionWeight?: number;
  regulatoryExposureLevel?: number;
  updatedBy: string;
}

export interface DeleteDepartmentCommand {
  id: string;
  tenantId: string;
}
