export interface IRoleCIMappingRepository {
  findByRoleId(roleId: string): Promise<{ id: string; roleId: string; capabilityInstanceId: string; isMandatory: boolean }[]>;
  save(roleId: string, capabilityInstanceId: string, isMandatory?: boolean): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByRoleId(roleId: string): Promise<void>;
}
