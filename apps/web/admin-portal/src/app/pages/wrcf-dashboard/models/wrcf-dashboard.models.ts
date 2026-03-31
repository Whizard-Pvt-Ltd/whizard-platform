export interface WrcfDashboardStats {
  functionalGroups: number;
  primaryWorkObjects: number;
  secondaryWorkObjects: number;
  capabilityInstances: number;
  skills: number;
  tasks: number;
  departments: number;
  roles: number;
}

export const EMPTY_STATS: WrcfDashboardStats = {
  functionalGroups: 0,
  primaryWorkObjects: 0,
  secondaryWorkObjects: 0,
  capabilityInstances: 0,
  skills: 0,
  tasks: 0,
  departments: 0,
  roles: 0
};
