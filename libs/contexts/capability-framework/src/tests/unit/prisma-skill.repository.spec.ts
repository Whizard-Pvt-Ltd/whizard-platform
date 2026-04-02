import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Skill } from '../../domain/aggregates/skill.aggregate';

const mockPrisma = {
  skill: {
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

import { PrismaSkillRepository } from '../../infrastructure/persistence/postgres/repositories/prisma-skill.repository';

describe('PrismaSkillRepository.save', () => {
  let repo: PrismaSkillRepository;
  let skill: Skill;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaSkillRepository();
    skill = Skill.reconstitute({
      id: '0',
      tenantId: '1',
      capabilityInstanceId: '107',
      name: 'Kill',
      cognitiveType: 'Procedural',
      skillCriticality: 'Medium',
      recertificationCycleMonths: 6,
      aiImpact: 'Medium'
    });
  });

  it('resyncs the sequence and retries once when skill id autoincrement is out of sync', async () => {
    mockPrisma.skill.create
      .mockRejectedValueOnce({ code: 'P2002', meta: { target: ['id'] } })
      .mockResolvedValueOnce(undefined);

    await repo.save(skill);

    expect(mockPrisma.skill.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('rethrows non-id unique constraint errors', async () => {
    const error = { code: 'P2002', meta: { target: ['publicUuid'] } };
    mockPrisma.skill.create.mockRejectedValueOnce(error);

    await expect(repo.save(skill)).rejects.toBe(error);
    expect(mockPrisma.$executeRaw).not.toHaveBeenCalled();
    expect(mockPrisma.skill.create).toHaveBeenCalledTimes(1);
  });
});
