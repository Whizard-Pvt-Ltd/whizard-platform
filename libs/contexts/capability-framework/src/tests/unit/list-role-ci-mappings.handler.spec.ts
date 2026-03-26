import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IRoleCIMappingRepository } from '../../domain/repositories/role-ci-mapping.repository';
import { ListRoleCIMappingsQueryHandler } from '../../application/query-handlers/list-role-ci-mappings.handler';

const makeRepo = (): IRoleCIMappingRepository => ({
  findByRoleId: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  deleteByRoleId: vi.fn()
});

describe('ListRoleCIMappingsQueryHandler', () => {
  let repo: IRoleCIMappingRepository;
  let handler: ListRoleCIMappingsQueryHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new ListRoleCIMappingsQueryHandler(repo);
  });

  it('delegates to findByRoleId with the correct roleId', async () => {
    vi.mocked(repo.findByRoleId).mockResolvedValue([]);
    await handler.execute('role-1');
    expect(repo.findByRoleId).toHaveBeenCalledWith('role-1');
  });

  it('returns the list of mappings from the repository', async () => {
    const mappings = [
      { id: 'map-1', roleId: 'role-1', ciId: 'ci-1' },
      { id: 'map-2', roleId: 'role-1', ciId: 'ci-2' }
    ];
    vi.mocked(repo.findByRoleId).mockResolvedValue(mappings);

    const result = await handler.execute('role-1');

    expect(result).toHaveLength(2);
    expect(result[0].ciId).toBe('ci-1');
    expect(result[1].ciId).toBe('ci-2');
  });

  it('returns an empty array when no mappings exist for the role', async () => {
    vi.mocked(repo.findByRoleId).mockResolvedValue([]);
    const result = await handler.execute('role-no-mappings');
    expect(result).toEqual([]);
  });

  it('propagates repository errors', async () => {
    vi.mocked(repo.findByRoleId).mockRejectedValue(new Error('DB error'));
    await expect(handler.execute('role-1')).rejects.toThrow('DB error');
  });
});
