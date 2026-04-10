import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import {
  CreateTaskCommandHandler,
  UpdateTaskCommandHandler,
  DeleteTaskCommandHandler
} from '../../application/command-handlers/task.handlers';
import { DomainException } from '../../application/domain-exception';
import { Task } from '../../domain/aggregates/task.aggregate';

const makeRepo = (): ITaskRepository => ({
  findBySkillId: vi.fn(),
  findAllDtos: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  hasControlPoints: vi.fn()
});

const createCmd = {
  tenantId: 'tenant-1',
  skillId: 'skill-1',
  name: 'Check pressure gauge',
  frequency: 'Daily',
  complexity: 'Medium'
};

describe('CreateTaskCommandHandler', () => {
  let repo: ITaskRepository;
  let handler: CreateTaskCommandHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new CreateTaskCommandHandler(repo);
  });

  it('saves a new Task aggregate', async () => {
    await handler.execute(createCmd);
    expect(repo.save).toHaveBeenCalledOnce();
    const saved = vi.mocked(repo.save).mock.calls[0][0];
    expect(saved).toBeInstanceOf(Task);
    expect(saved.name).toBe('Check pressure gauge');
    expect(saved.skillId).toBe('skill-1');
    expect(saved.tenantId).toBe('tenant-1');
  });

  it('forwards optional fields to the aggregate', async () => {
    await handler.execute({ ...createCmd, standardDuration: 30, requiredProficiencyLevel: 'L2' });
    const saved = vi.mocked(repo.save).mock.calls[0][0];
    expect(saved.standardDuration).toBe(30);
    expect(saved.requiredProficiencyLevel).toBe('L2');
  });

  it('propagates repository errors', async () => {
    vi.mocked(repo.save).mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(createCmd)).rejects.toThrow('DB error');
  });
});

describe('UpdateTaskCommandHandler', () => {
  let repo: ITaskRepository;
  let handler: UpdateTaskCommandHandler;
  let existingTask: Task;

  beforeEach(() => {
    repo = makeRepo();
    handler = new UpdateTaskCommandHandler(repo);
    existingTask = Task.reconstitute({ id: 'task-1', ...createCmd });
  });

  it('updates and persists the task', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingTask);
    await handler.execute({ id: 'task-1', tenantId: 'tenant-1', name: 'Renamed Task', frequency: 'Weekly' });
    expect(repo.update).toHaveBeenCalledOnce();
    const updated = vi.mocked(repo.update).mock.calls[0][0];
    expect(updated.name).toBe('Renamed Task');
    expect(updated.frequency).toBe('Weekly');
  });

  it('throws DomainException when task not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost-id', tenantId: 'tenant-1' }))
      .rejects.toThrow(DomainException);
  });

  it('throws DomainException with descriptive message', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost-id', tenantId: 'tenant-1' }))
      .rejects.toThrow('Task ghost-id not found');
  });
});

describe('DeleteTaskCommandHandler', () => {
  let repo: ITaskRepository;
  let handler: DeleteTaskCommandHandler;
  let existingTask: Task;

  beforeEach(() => {
    repo = makeRepo();
    handler = new DeleteTaskCommandHandler(repo);
    existingTask = Task.reconstitute({ id: 'task-1', ...createCmd });
  });

  it('deletes the task from the repository', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingTask);
    await handler.execute({ id: 'task-1', tenantId: 'tenant-1' });
    expect(repo.delete).toHaveBeenCalledWith('task-1');
  });

  it('throws DomainException when task not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost-id', tenantId: 'tenant-1' }))
      .rejects.toThrow(DomainException);
  });
});
