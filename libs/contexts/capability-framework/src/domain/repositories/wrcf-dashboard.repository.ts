export interface WrcfDashboardStatsDto {
  functionalGroups: number;
  primaryWorkObjects: number;
  secondaryWorkObjects: number;
  capabilityInstances: number;
  skills: number;
  tasks: number;
  departments: number;
  roles: number;
}

export interface IWrcfDashboardRepository {
  getDashboardStats(tenantIds: string[], industryId: string): Promise<WrcfDashboardStatsDto>;
}
