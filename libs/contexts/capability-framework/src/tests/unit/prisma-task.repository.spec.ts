import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Task } from '../../domain/aggregates/task.aggregate';

const mockPrisma = {
  task: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn()
  },
  $executeRaw: vi.fn()
};

vi.mock('@whizard/shared-infrastructure', () => ({
  getPrisma: () => mockPrisma
}));

import { PrismaTaskRepository } from '../../infrastructure/persistence/postgres/repositories/prisma-task.repository';

describe('PrismaTaskRepository.save', () => {
  let repo: PrismaTaskRepository;
  let task: Task;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaTaskRepository();
    task = Task.reconstitute({
      id: '0',
      tenantId: '1',
      skillId: '303',
      name: 'ku',
      description: 'csfwefwe',
      frequency: 'Daily',
      complexity: 'Medium',
      standardDuration: 55,
      requiredProficiencyLevel: 'L1'
    });
  });

  it('resyncs the sequence and retries once when task id autoincrement is out of sync', async () => {
    mockPrisma.task.create
      .mockRejectedValueOnce({ code: 'P2002', meta: { target: ['id'] } })
      .mockResolvedValueOnce(undefined);

    await repo.save(task);

    expect(mockPrisma.task.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
  });
});
