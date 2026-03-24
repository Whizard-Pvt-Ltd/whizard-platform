import { Task } from '../../domain/aggregates/task.aggregate';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import type { CreateTaskCommand, UpdateTaskCommand, DeleteTaskCommand } from '../commands/task.commands';
import { DomainException } from '../domain-exception';

export class CreateTaskCommandHandler {
  constructor(private readonly repo: ITaskRepository) {}

  async execute(cmd: CreateTaskCommand): Promise<void> {
    const task = Task.create({
      tenantId: cmd.tenantId,
      skillId: cmd.skillId,
      name: cmd.name,
      description: cmd.description,
      frequency: cmd.frequency,
      complexity: cmd.complexity,
      standardDuration: cmd.standardDuration,
      requiredProficiencyLevel: cmd.requiredProficiencyLevel
    });
    await this.repo.save(task);
  }
}

export class UpdateTaskCommandHandler {
  constructor(private readonly repo: ITaskRepository) {}

  async execute(cmd: UpdateTaskCommand): Promise<void> {
    const task = await this.repo.findById(cmd.id);
    if (!task) throw new DomainException(`Task ${cmd.id} not found`);
    task.update({
      name: cmd.name,
      description: cmd.description,
      frequency: cmd.frequency,
      complexity: cmd.complexity,
      standardDuration: cmd.standardDuration,
      requiredProficiencyLevel: cmd.requiredProficiencyLevel
    });
    await this.repo.update(task);
  }
}

export class DeleteTaskCommandHandler {
  constructor(private readonly repo: ITaskRepository) {}

  async execute(cmd: DeleteTaskCommand): Promise<void> {
    const task = await this.repo.findById(cmd.id);
    if (!task) throw new DomainException(`Task ${cmd.id} not found`);
    task.delete();
    await this.repo.delete(cmd.id);
  }
}
