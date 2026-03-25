export interface IRoleCIMappingRepository {
  findByRoleId(roleId: string): Promise<{ id: string; roleId: string; ciId: string }[]>;
  save(roleId: string, ciId: string, createdBy: string): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByRoleId(roleId: string): Promise<void>;
}
