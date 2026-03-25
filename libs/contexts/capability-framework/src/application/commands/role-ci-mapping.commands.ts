export interface SaveRoleCIMappingsCommand {
  roleId: string;
  ciIds: string[];
  createdBy: string;
}

export interface DeleteRoleCIMappingCommand {
  id: string;
}
