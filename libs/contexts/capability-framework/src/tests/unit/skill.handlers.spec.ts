import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ISkillRepository } from '../../domain/repositories/skill.repository';
import {
  CreateSkillCommandHandler,
  UpdateSkillCommandHandler,
  DeleteSkillCommandHandler
} from '../../application/command-handlers/skill.handlers';
import { DomainException } from '../../application/domain-exception';
import { Skill } from '../../domain/aggregates/skill.aggregate';

const makeRepo = (): ISkillRepository => ({
  findByCapabilityInstanceId: vi.fn(),
  findAllDtos: vi.fn(),
  findById: vi.fn(),
  existsByName: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
});

const createCmd = {
  tenantId: 'tenant-1',
  capabilityInstanceId: 'ci-1',
  name: 'Valve Inspection',
  cognitiveType: 'Procedural',
  skillCriticality: 'High',
  recertificationCycleMonths: 6,
  aiImpact: 'Medium'
};

describe('CreateSkillCommandHandler', () => {
  let repo: ISkillRepository;
  let handler: CreateSkillCommandHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new CreateSkillCommandHandler(repo);
  });

  it('saves a new Skill aggregate', async () => {
    await handler.execute(createCmd);
    expect(repo.save).toHaveBeenCalledOnce();
    const saved = vi.mocked(repo.save).mock.calls[0][0];
    expect(saved).toBeInstanceOf(Skill);
    expect(saved.name).toBe('Valve Inspection');
    expect(saved.capabilityInstanceId).toBe('ci-1');
    expect(saved.tenantId).toBe('tenant-1');
  });

  it('propagates repository errors', async () => {
    vi.mocked(repo.save).mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(createCmd)).rejects.toThrow('DB error');
  });
});

describe('UpdateSkillCommandHandler', () => {
  let repo: ISkillRepository;
  let handler: UpdateSkillCommandHandler;
  let existingSkill: Skill;

  beforeEach(() => {
    repo = makeRepo();
    handler = new UpdateSkillCommandHandler(repo);
    existingSkill = Skill.reconstitute({ id: 'skill-1', ...createCmd });
  });

  it('updates and persists the skill', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingSkill);
    await handler.execute({ id: 'skill-1', tenantId: 'tenant-1', name: 'Renamed Skill' });
    expect(repo.findById).toHaveBeenCalledWith('skill-1');
    expect(repo.update).toHaveBeenCalledOnce();
    const updated = vi.mocked(repo.update).mock.calls[0][0];
    expect(updated.name).toBe('Renamed Skill');
  });

  it('throws DomainException when skill not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost-id', tenantId: 'tenant-1' }))
      .rejects.toThrow(DomainException);
  });

  it('throws DomainException with descriptive message', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost-id', tenantId: 'tenant-1' }))
      .rejects.toThrow('Skill ghost-id not found');
  });
});

describe('DeleteSkillCommandHandler', () => {
  let repo: ISkillRepository;
  let handler: DeleteSkillCommandHandler;
  let existingSkill: Skill;

  beforeEach(() => {
    repo = makeRepo();
    handler = new DeleteSkillCommandHandler(repo);
    existingSkill = Skill.reconstitute({ id: 'skill-1', ...createCmd });
  });

  it('deletes the skill from the repository', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingSkill);
    await handler.execute({ id: 'skill-1', tenantId: 'tenant-1' });
    expect(repo.delete).toHaveBeenCalledWith('skill-1');
  });

  it('throws DomainException when skill not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost-id', tenantId: 'tenant-1' }))
      .rejects.toThrow(DomainException);
  });
});
