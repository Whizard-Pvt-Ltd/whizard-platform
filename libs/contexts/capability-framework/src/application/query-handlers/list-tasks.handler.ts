import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { TaskDto } from '../dto/task.dto';

export class ListTasksQueryHandler {
  constructor(private readonly repo: ITaskRepository) {}

  async execute(tenantId: string, skillId: string): Promise<TaskDto[]> {
    return this.repo.findAllDtos(tenantId, skillId);
  }
}
