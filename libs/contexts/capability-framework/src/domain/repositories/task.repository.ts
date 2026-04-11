import type { Task } from '../aggregates/task.aggregate';

export interface TaskDto {
  id: string;
  skillId: string;
  name: string;
  description?: string;
  frequency: string;
  complexity: string;
  standardDuration: number;
  requiredProficiencyLevel: string;
  canEdit: boolean;
}

export interface ITaskRepository {
  findBySkillId(tenantId: string, skillId: string): Promise<Task[]>;
  findAllDtos(skillId: string, tenantIds: string[], ownedTenantIds: string[]): Promise<TaskDto[]>;
  findById(id: string): Promise<Task | null>;
  existsByName(name: string, skillId: string, tenantId: string): Promise<boolean>;
  save(task: Task): Promise<void>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
  hasControlPoints(id: string): Promise<boolean>;
}
