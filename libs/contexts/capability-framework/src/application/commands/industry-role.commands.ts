export interface CreateIndustryRoleCommand {
  tenantId: string;
  departmentId: string;
  industryId: string;
  name: string;
  seniorityLevel: string;
  reportingTo?: string;
  roleCriticalityScore?: number;
  createdBy: string;
}

export interface UpdateIndustryRoleCommand {
  id: string;
  tenantId: string;
  name?: string;
  seniorityLevel?: string;
  reportingTo?: string;
  roleCriticalityScore?: number;
  updatedBy: string;
}

export interface DeleteIndustryRoleCommand {
  id: string;
  tenantId: string;
}
