import { getPrisma } from '@whizard/shared-infrastructure';
import type { TaskDto } from '../../../../application/dto/task.dto';
import type { ITaskRepository } from '../../../../domain/repositories/task.repository';
import { Task } from '../../../../domain/aggregates/task.aggregate';

export class PrismaTaskRepository implements ITaskRepository {
  private readonly prisma = getPrisma();

  async findBySkillId(tenantId: string, skillId: string): Promise<Task[]> {
    const rows = await this.prisma.task.findMany({ where: { tenantId, skillId, isActive: true } });
    return rows.map(r => Task.reconstitute({
      id: r.id,
      tenantId: r.tenantId,
      skillId: r.skillId,
      name: r.name,
      description: r.description ?? undefined,
      frequency: r.frequency,
      complexity: r.complexity,
      standardDuration: r.standardDuration,
      requiredProficiencyLevel: r.requiredProficiencyLevel ?? undefined
    }));
  }

  async findAllDtos(tenantId: string, skillId: string): Promise<TaskDto[]> {
    const rows = await this.prisma.task.findMany({
      where: { tenantId, skillId, isActive: true },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id,
      skillId: r.skillId,
      name: r.name,
      description: r.description ?? undefined,
      frequency: r.frequency,
      complexity: r.complexity,
      standardDuration: r.standardDuration,
      requiredProficiencyLevel: r.requiredProficiencyLevel ?? undefined
    }));
  }

  async findById(id: string): Promise<Task | null> {
    const r = await this.prisma.task.findUnique({ where: { id } });
    if (!r) return null;
    return Task.reconstitute({
      id: r.id,
      tenantId: r.tenantId,
      skillId: r.skillId,
      name: r.name,
      description: r.description ?? undefined,
      frequency: r.frequency,
      complexity: r.complexity,
      standardDuration: r.standardDuration,
      requiredProficiencyLevel: r.requiredProficiencyLevel ?? undefined
    });
  }

  async save(task: Task): Promise<void> {
    await this.prisma.task.create({
      data: {
        id: task.id,
        tenantId: task.tenantId,
        skillId: task.skillId,
        name: task.name,
        description: task.description,
        frequency: task.frequency,
        complexity: task.complexity,
        standardDuration: task.standardDuration ?? 0,
        requiredProficiencyLevel: task.requiredProficiencyLevel ?? 'L1'
      }
    });
  }

  async update(task: Task): Promise<void> {
    await this.prisma.task.update({
      where: { id: task.id },
      data: {
        name: task.name,
        description: task.description,
        frequency: task.frequency,
        complexity: task.complexity,
        standardDuration: task.standardDuration ?? 0,
        requiredProficiencyLevel: task.requiredProficiencyLevel ?? 'L1'
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.update({ where: { id }, data: { isActive: false } });
  }
}
