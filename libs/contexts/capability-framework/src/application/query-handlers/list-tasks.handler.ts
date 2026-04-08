import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { TaskDto } from '../dto/task.dto';

export class ListTasksQueryHandler {
  constructor(private readonly repo: ITaskRepository) {}

  async execute(skillId: string, tenantId?: string): Promise<TaskDto[]> {
    return this.repo.findAllDtos(skillId, tenantId);
  }
}
