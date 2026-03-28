import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TaskDto } from '../../application/dto/task.dto';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import { ListTasksQueryHandler } from '../../application/query-handlers/list-tasks.handler';

const makeRepo = (): ITaskRepository => ({
  findBySkillId: vi.fn(),
  findAllDtos: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
});

const taskDto = (overrides: Partial<TaskDto> = {}): TaskDto => ({
  id: 'task-1',
  skillId: 'skill-1',
  name: 'Check pressure gauge',
  frequency: 'Daily',
  complexity: 'Medium',
  ...overrides
});

describe('ListTasksQueryHandler', () => {
  let repo: ITaskRepository;
  let handler: ListTasksQueryHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new ListTasksQueryHandler(repo);
  });

  it('delegates to findAllDtos with correct tenantId and skillId', async () => {
    vi.mocked(repo.findAllDtos).mockResolvedValue([]);
    await handler.execute('tenant-1', 'skill-1');
    expect(repo.findAllDtos).toHaveBeenCalledWith('tenant-1', 'skill-1');
  });

  it('returns the list of TaskDtos from the repository', async () => {
    const dtos = [
      taskDto(),
      taskDto({ id: 'task-2', name: 'Lubricate bearings', frequency: 'Weekly' })
    ];
    vi.mocked(repo.findAllDtos).mockResolvedValue(dtos);

    const result = await handler.execute('tenant-1', 'skill-1');

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Check pressure gauge');
    expect(result[1].frequency).toBe('Weekly');
  });

  it('returns an empty array when no tasks exist for the skill', async () => {
    vi.mocked(repo.findAllDtos).mockResolvedValue([]);
    const result = await handler.execute('tenant-1', 'skill-empty');
    expect(result).toEqual([]);
  });

  it('propagates repository errors', async () => {
    vi.mocked(repo.findAllDtos).mockRejectedValue(new Error('DB error'));
    await expect(handler.execute('tenant-1', 'skill-1')).rejects.toThrow('DB error');
  });

  it('passes through optional dto fields unchanged', async () => {
    const dto = taskDto({ standardDuration: 45, requiredProficiencyLevel: 3 });
    vi.mocked(repo.findAllDtos).mockResolvedValue([dto]);

    const result = await handler.execute('tenant-1', 'skill-1');

    expect(result[0].standardDuration).toBe(45);
    expect(result[0].requiredProficiencyLevel).toBe(3);
  });
});
