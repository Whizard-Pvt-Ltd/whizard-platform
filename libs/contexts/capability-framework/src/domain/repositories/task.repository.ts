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
}

export interface ITaskRepository {
  findBySkillId(tenantId: string, skillId: string): Promise<Task[]>;
  findAllDtos(skillId: string, tenantId?: string): Promise<TaskDto[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}
