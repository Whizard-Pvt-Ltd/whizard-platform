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
  name: 'Field Engineer'
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
  });

  it('returns the new role id and name', async () => {
    const result = await handler.execute(createCmd);
    expect(result.name).toBe('Field Engineer');
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('passes optional description through', async () => {
    await handler.execute({ ...createCmd, description: 'Field operations' });
    const saved = vi.mocked(repo.save).mock.calls[0][0];
    expect(saved.description).toBe('Field operations');
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

  it('updates name and persists', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existing);
    await handler.execute({ id: 'role-1', tenantId: 'tenant-1', name: 'Senior Engineer' });
    expect(repo.update).toHaveBeenCalledOnce();
    const updated = vi.mocked(repo.update).mock.calls[0][0];
    expect(updated.name).toBe('Senior Engineer');
  });

  it('updates description', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existing);
    await handler.execute({ id: 'role-1', tenantId: 'tenant-1', description: 'New desc' });
    const updated = vi.mocked(repo.update).mock.calls[0][0];
    expect(updated.description).toBe('New desc');
  });

  it('throws DomainException when role not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost', tenantId: 'tenant-1' }))
      .rejects.toThrow(DomainException);
  });

  it('throws with a descriptive message', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost', tenantId: 'tenant-1' }))
      .rejects.toThrow('Role ghost not found');
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
