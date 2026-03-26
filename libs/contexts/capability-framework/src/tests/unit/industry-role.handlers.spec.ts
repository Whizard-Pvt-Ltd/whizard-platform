import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndustryRole } from '../../domain/aggregates/industry-role.aggregate';
import type { IIndustryRoleRepository } from '../../domain/repositories/industry-role.repository';
import {
  CreateIndustryRoleCommandHandler,
  UpdateIndustryRoleCommandHandler,
  DeleteIndustryRoleCommandHandler
} from '../../application/command-handlers/industry-role.handlers';
import { DomainException } from '../../application/domain-exception';

const makeRepo = (): IIndustryRoleRepository => ({
  findByDepartmentId: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
});

const createCmd = {
  tenantId: 'tenant-1',
  departmentId: 'dept-1',
  industryId: 'industry-1',
  name: 'Field Engineer',
  seniorityLevel: 'Associate',
  createdBy: 'user-1'
};

describe('CreateIndustryRoleCommandHandler', () => {
  let repo: IIndustryRoleRepository;
  let handler: CreateIndustryRoleCommandHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new CreateIndustryRoleCommandHandler(repo);
  });

  it('saves a new IndustryRole aggregate', async () => {
    await handler.execute(createCmd);
    expect(repo.save).toHaveBeenCalledOnce();
    const saved = vi.mocked(repo.save).mock.calls[0][0];
    expect(saved).toBeInstanceOf(IndustryRole);
    expect(saved.name).toBe('Field Engineer');
    expect(saved.departmentId).toBe('dept-1');
    expect(saved.seniorityLevel).toBe('Associate');
  });

  it('returns the new role id and name', async () => {
    const result = await handler.execute(createCmd);
    expect(result.name).toBe('Field Engineer');
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('passes optional fields through', async () => {
    await handler.execute({
      ...createCmd,
      reportingTo: 'Engineering Manager',
      roleCriticalityScore: 0.8
    });
    const saved = vi.mocked(repo.save).mock.calls[0][0];
    expect(saved.reportingTo).toBe('Engineering Manager');
    expect(saved.roleCriticalityScore).toBe(0.8);
  });

  it('propagates repository errors', async () => {
    vi.mocked(repo.save).mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(createCmd)).rejects.toThrow('DB error');
  });
});

describe('UpdateIndustryRoleCommandHandler', () => {
  let repo: IIndustryRoleRepository;
  let handler: UpdateIndustryRoleCommandHandler;
  let existing: IndustryRole;

  beforeEach(() => {
    repo = makeRepo();
    handler = new UpdateIndustryRoleCommandHandler(repo);
    existing = IndustryRole.reconstitute({ ...createCmd, id: 'role-1' });
  });

  it('updates name and seniority level, then persists', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existing);
    await handler.execute({ id: 'role-1', tenantId: 'tenant-1', name: 'Senior Engineer', seniorityLevel: 'Team Lead', updatedBy: 'user-1' });
    expect(repo.update).toHaveBeenCalledOnce();
    const updated = vi.mocked(repo.update).mock.calls[0][0];
    expect(updated.name).toBe('Senior Engineer');
    expect(updated.seniorityLevel).toBe('Team Lead');
  });

  it('updates reportingTo and roleCriticalityScore', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existing);
    await handler.execute({ id: 'role-1', tenantId: 'tenant-1', reportingTo: 'CTO', roleCriticalityScore: 0.9, updatedBy: 'user-1' });
    const updated = vi.mocked(repo.update).mock.calls[0][0];
    expect(updated.reportingTo).toBe('CTO');
    expect(updated.roleCriticalityScore).toBe(0.9);
  });

  it('throws DomainException when role not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost', tenantId: 'tenant-1', updatedBy: 'user-1' }))
      .rejects.toThrow(DomainException);
  });

  it('throws with a descriptive message', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost', tenantId: 'tenant-1', updatedBy: 'user-1' }))
      .rejects.toThrow('IndustryRole ghost not found');
  });
});

describe('DeleteIndustryRoleCommandHandler', () => {
  let repo: IIndustryRoleRepository;
  let handler: DeleteIndustryRoleCommandHandler;
  let existing: IndustryRole;

  beforeEach(() => {
    repo = makeRepo();
    handler = new DeleteIndustryRoleCommandHandler(repo);
    existing = IndustryRole.reconstitute({ ...createCmd, id: 'role-1' });
  });

  it('deletes the role from the repository', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existing);
    await handler.execute({ id: 'role-1', tenantId: 'tenant-1' });
    expect(repo.delete).toHaveBeenCalledWith('role-1');
  });

  it('throws DomainException when role not found', async () => {
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
