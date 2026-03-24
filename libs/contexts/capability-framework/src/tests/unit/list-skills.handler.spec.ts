import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ISkillRepository } from '../../domain/repositories/skill.repository';
import { ListSkillsQueryHandler } from '../../application/query-handlers/list-skills.handler';
import type { SkillDto } from '../../application/dto/skill.dto';

const makeRepo = (): ISkillRepository => ({
  findByCiId: vi.fn(),
  findAllDtos: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
});

const skillDto = (overrides: Partial<SkillDto> = {}): SkillDto => ({
  id: 'skill-1',
  ciId: 'ci-1',
  name: 'Valve Inspection',
  cognitiveType: 'Procedural',
  skillCriticality: 'High',
  recertificationCycle: 6,
  aiImpact: 'Medium',
  ...overrides
});

describe('ListSkillsQueryHandler', () => {
  let repo: ISkillRepository;
  let handler: ListSkillsQueryHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new ListSkillsQueryHandler(repo);
  });

  it('delegates to findAllDtos with correct tenantId and ciId', async () => {
    vi.mocked(repo.findAllDtos).mockResolvedValue([]);
    await handler.execute('tenant-1', 'ci-1');
    expect(repo.findAllDtos).toHaveBeenCalledWith('tenant-1', 'ci-1');
  });

  it('returns the list of SkillDtos from the repository', async () => {
    const dtos = [skillDto(), skillDto({ id: 'skill-2', name: 'Pump Alignment' })];
    vi.mocked(repo.findAllDtos).mockResolvedValue(dtos);

    const result = await handler.execute('tenant-1', 'ci-1');

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Valve Inspection');
    expect(result[1].name).toBe('Pump Alignment');
  });

  it('returns an empty array when no skills exist for the CI', async () => {
    vi.mocked(repo.findAllDtos).mockResolvedValue([]);
    const result = await handler.execute('tenant-1', 'ci-empty');
    expect(result).toEqual([]);
  });

  it('propagates repository errors', async () => {
    vi.mocked(repo.findAllDtos).mockRejectedValue(new Error('DB error'));
    await expect(handler.execute('tenant-1', 'ci-1')).rejects.toThrow('DB error');
  });
});
