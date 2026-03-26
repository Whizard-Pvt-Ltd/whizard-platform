import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IIndustryRoleRepository } from '../../domain/repositories/industry-role.repository';
import { ListIndustryRolesQueryHandler } from '../../application/query-handlers/list-industry-roles.handler';

const makeRepo = (): IIndustryRoleRepository => ({
  findByDepartmentId: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
});

const roleDto = (overrides = {}) => ({
  id: 'role-1',
  name: 'Field Engineer',
  departmentId: 'dept-1',
  seniorityLevel: 'Associate',
  ...overrides
});

describe('ListIndustryRolesQueryHandler', () => {
  let repo: IIndustryRoleRepository;
  let handler: ListIndustryRolesQueryHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new ListIndustryRolesQueryHandler(repo);
  });

  it('delegates to findByDepartmentId with correct tenantId and departmentId', async () => {
    vi.mocked(repo.findByDepartmentId).mockResolvedValue([]);
    await handler.execute('tenant-1', 'dept-1');
    expect(repo.findByDepartmentId).toHaveBeenCalledWith('tenant-1', 'dept-1');
  });

  it('returns the list of role dtos from the repository', async () => {
    const dtos = [roleDto(), roleDto({ id: 'role-2', name: 'Senior Engineer', seniorityLevel: 'Team Lead' })];
    vi.mocked(repo.findByDepartmentId).mockResolvedValue(dtos);

    const result = await handler.execute('tenant-1', 'dept-1');

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Field Engineer');
    expect(result[1].seniorityLevel).toBe('Team Lead');
  });

  it('returns an empty array when no roles exist for the department', async () => {
    vi.mocked(repo.findByDepartmentId).mockResolvedValue([]);
    const result = await handler.execute('tenant-1', 'dept-empty');
    expect(result).toEqual([]);
  });

  it('propagates repository errors', async () => {
    vi.mocked(repo.findByDepartmentId).mockRejectedValue(new Error('DB error'));
    await expect(handler.execute('tenant-1', 'dept-1')).rejects.toThrow('DB error');
  });
});
