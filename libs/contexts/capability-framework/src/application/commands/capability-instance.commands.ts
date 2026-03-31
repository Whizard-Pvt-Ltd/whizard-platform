export interface CreateCapabilityInstanceCommand {
  tenantId: string;
  functionalGroupId: string;
  pwoId?: string;
  swoId?: string;
  capabilityId: string;
  proficiencyId: string;
}

export interface DeleteCapabilityInstanceCommand {
  id: string;
  tenantId: string;
}
