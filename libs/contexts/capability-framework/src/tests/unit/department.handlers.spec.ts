import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Department } from '../../domain/aggregates/department.aggregate';
import type { IDepartmentRepository } from '../../domain/repositories/department.repository';
import {
  CreateDepartmentCommandHandler,
  UpdateDepartmentCommandHandler,
  DeleteDepartmentCommandHandler
} from '../../application/command-handlers/department.handlers';
import { DomainException } from '../../application/domain-exception';

const makeRepo = (): IDepartmentRepository => ({
  findByIndustryId: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
});

const createCmd = {
  tenantId: 'tenant-1',
  industryId: 'industry-1',
  name: 'Engineering',
  functionalGroupIds: ['fg-1', 'fg-2']
};

describe('CreateDepartmentCommandHandler', () => {
  let repo: IDepartmentRepository;
  let handler: CreateDepartmentCommandHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new CreateDepartmentCommandHandler(repo);
  });

  it('saves a new Department aggregate', async () => {
    await handler.execute(createCmd);
    expect(repo.save).toHaveBeenCalledOnce();
    const [savedDept, savedFgIds] = vi.mocked(repo.save).mock.calls[0];
    expect(savedDept).toBeInstanceOf(Department);
    expect(savedDept.name).toBe('Engineering');
    expect(savedDept.industryId).toBe('industry-1');
    expect(savedFgIds).toEqual(['fg-1', 'fg-2']);
  });

  it('returns the new department id and name', async () => {
    const result = await handler.execute(createCmd);
    expect(result.name).toBe('Engineering');
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('passes optional score fields through', async () => {
    await handler.execute({
      ...createCmd,
      operationalCriticalityScore: 0.8,
      revenueContributionWeight: 0.5,
      regulatoryExposureLevel: 0.3
    });
    const [saved] = vi.mocked(repo.save).mock.calls[0];
    expect(saved.operationalCriticalityScore).toBe(0.8);
    expect(saved.revenueContributionWeight).toBe(0.5);
    expect(saved.regulatoryExposureLevel).toBe(0.3);
  });

  it('propagates repository errors', async () => {
    vi.mocked(repo.save).mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(createCmd)).rejects.toThrow('DB error');
  });
});

describe('UpdateDepartmentCommandHandler', () => {
  let repo: IDepartmentRepository;
  let handler: UpdateDepartmentCommandHandler;
  let existing: Department;

  beforeEach(() => {
    repo = makeRepo();
    handler = new UpdateDepartmentCommandHandler(repo);
    existing = Department.reconstitute({ ...createCmd, id: 'dept-1' });
  });

  it('updates name and persists', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existing);
    await handler.execute({ id: 'dept-1', tenantId: 'tenant-1', name: 'Operations' });
    expect(repo.findById).toHaveBeenCalledWith('dept-1');
    expect(repo.update).toHaveBeenCalledOnce();
    const [updated] = vi.mocked(repo.update).mock.calls[0];
    expect(updated.name).toBe('Operations');
  });

  it('passes updated functionalGroupIds to the repository', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existing);
    await handler.execute({ id: 'dept-1', tenantId: 'tenant-1', functionalGroupIds: ['fg-3'] });
    const [, fgIds] = vi.mocked(repo.update).mock.calls[0];
    expect(fgIds).toEqual(['fg-3']);
  });

  it('falls back to existing functionalGroupIds when not provided in command', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existing);
    await handler.execute({ id: 'dept-1', tenantId: 'tenant-1', name: 'Renamed' });
    const [, fgIds] = vi.mocked(repo.update).mock.calls[0];
    expect(fgIds).toEqual(['fg-1', 'fg-2']);
  });

  it('throws DomainException when department not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost', tenantId: 'tenant-1' }))
      .rejects.toThrow(DomainException);
  });

  it('throws with a descriptive message', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost', tenantId: 'tenant-1' }))
      .rejects.toThrow('Department ghost not found');
  });
});

describe('DeleteDepartmentCommandHandler', () => {
  let repo: IDepartmentRepository;
  let handler: DeleteDepartmentCommandHandler;
  let existing: Department;

  beforeEach(() => {
    repo = makeRepo();
    handler = new DeleteDepartmentCommandHandler(repo);
    existing = Department.reconstitute({ ...createCmd, id: 'dept-1' });
  });

  it('deletes the department from the repository', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existing);
    await handler.execute({ id: 'dept-1', tenantId: 'tenant-1' });
    expect(repo.delete).toHaveBeenCalledWith('dept-1');
  });

  it('throws DomainException when department not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost', tenantId: 'tenant-1' }))
      .rejects.toThrow(DomainException);
  });

  it('does not call delete when not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost', tenantId: 'tenant-1' })).rejects.toThrow();
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
