export interface CreateTaskCommand {
  tenantId: string;
  skillId: string;
  name: string;
  description?: string;
  frequency: string;
  complexity: string;
  standardDuration?: number;
  requiredProficiencyLevel?: number;
}

export interface UpdateTaskCommand {
  id: string;
  tenantId: string;
  name?: string;
  description?: string;
  frequency?: string;
  complexity?: string;
  standardDuration?: number;
  requiredProficiencyLevel?: number;
}

export interface DeleteTaskCommand {
  id: string;
  tenantId: string;
}
