import { getPrisma } from '@whizard/shared-infrastructure';
import type { TaskDto } from '../../../../application/dto/task.dto';
import type { ITaskRepository } from '../../../../domain/repositories/task.repository';
import { Task } from '../../../../domain/aggregates/task.aggregate';

export class PrismaTaskRepository implements ITaskRepository {
  private readonly prisma = getPrisma();

  private async createTask(task: Task): Promise<void> {
    await this.prisma.task.create({
      data: {
        tenantId: BigInt(task.tenantId),
        skillId: BigInt(task.skillId),
        name: task.name,
        description: task.description,
        frequency: task.frequency,
        complexity: task.complexity,
        standardDuration: task.standardDuration ?? 0,
        requiredProficiencyLevel: task.requiredProficiencyLevel ?? 'L1'
      }
    });
  }

  private isDuplicateTaskIdError(error: unknown): boolean {
    if (!error || typeof error !== 'object' || !('code' in error)) return false;
    if (error.code !== 'P2002') return false;

    const target = 'meta' in error && error.meta && typeof error.meta === 'object' && 'target' in error.meta
      ? error.meta.target
      : undefined;

    if (Array.isArray(target)) {
      return target.includes('id');
    }

    return typeof target === 'string' && target.includes('id');
  }

  private async resyncTaskIdSequence(): Promise<void> {
    await this.prisma.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('tasks', 'id'),
        COALESCE((SELECT MAX(id) FROM tasks), 0) + 1,
        false
      )
    `;
  }

  async findBySkillId(tenantId: string, skillId: string): Promise<Task[]> {
    const rows = await this.prisma.task.findMany({
      where: {
        tenantId: BigInt(tenantId),
        skillId: BigInt(skillId),
        isActive: true
      }
    });
    return rows.map(r => Task.reconstitute({
      id: r.id.toString(),
      tenantId: r.tenantId.toString(),
      skillId: r.skillId.toString(),
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
      where: {
        tenantId: BigInt(tenantId),
        skillId: BigInt(skillId),
        isActive: true
      },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id.toString(),
      skillId: r.skillId.toString(),
      name: r.name,
      description: r.description ?? undefined,
      frequency: r.frequency,
      complexity: r.complexity,
      standardDuration: r.standardDuration,
      requiredProficiencyLevel: r.requiredProficiencyLevel ?? undefined
    }));
  }

  async findById(id: string): Promise<Task | null> {
    const r = await this.prisma.task.findUnique({
      where: { id: BigInt(id) }
    });
    if (!r) return null;
    return Task.reconstitute({
      id: r.id.toString(),
      tenantId: r.tenantId.toString(),
      skillId: r.skillId.toString(),
      name: r.name,
      description: r.description ?? undefined,
      frequency: r.frequency,
      complexity: r.complexity,
      standardDuration: r.standardDuration,
      requiredProficiencyLevel: r.requiredProficiencyLevel ?? undefined
    });
  }

  async save(task: Task): Promise<void> {
    try {
      await this.createTask(task);
    } catch (error) {
      if (!this.isDuplicateTaskIdError(error)) {
        throw error;
      }

      await this.resyncTaskIdSequence();
      await this.createTask(task);
    }
  }

  async update(task: Task): Promise<void> {
    await this.prisma.task.update({
      where: { id: BigInt(task.id) },
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
    await this.prisma.task.update({ where: { id: BigInt(id) }, data: { isActive: false } });
  }
}
