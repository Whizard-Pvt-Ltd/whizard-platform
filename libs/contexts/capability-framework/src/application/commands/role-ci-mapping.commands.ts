export interface SaveRoleCIMappingsCommand {
  roleId: string;
  capabilityInstanceIds: string[];
  isMandatory?: boolean;
}

export interface DeleteRoleCIMappingCommand {
  id: string;
}
