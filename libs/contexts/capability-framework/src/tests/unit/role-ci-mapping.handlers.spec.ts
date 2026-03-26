import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IRoleCIMappingRepository } from '../../domain/repositories/role-ci-mapping.repository';
import {
  SaveRoleCIMappingsCommandHandler,
  DeleteRoleCIMappingCommandHandler
} from '../../application/command-handlers/role-ci-mapping.handlers';

const makeRepo = (): IRoleCIMappingRepository => ({
  findByRoleId: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  deleteByRoleId: vi.fn()
});

describe('SaveRoleCIMappingsCommandHandler', () => {
  let repo: IRoleCIMappingRepository;
  let handler: SaveRoleCIMappingsCommandHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new SaveRoleCIMappingsCommandHandler(repo);
  });

  it('clears existing mappings before saving new ones', async () => {
    await handler.execute({ roleId: 'role-1', ciIds: ['ci-1', 'ci-2'], createdBy: 'user-1' });
    expect(repo.deleteByRoleId).toHaveBeenCalledWith('role-1');
    expect(repo.deleteByRoleId).toHaveBeenCalledBefore(vi.mocked(repo.save));
  });

  it('saves one record per ciId', async () => {
    await handler.execute({ roleId: 'role-1', ciIds: ['ci-1', 'ci-2', 'ci-3'], createdBy: 'user-1' });
    expect(repo.save).toHaveBeenCalledTimes(3);
  });

  it('passes roleId, ciId and createdBy to each save call', async () => {
    await handler.execute({ roleId: 'role-1', ciIds: ['ci-A', 'ci-B'], createdBy: 'user-5' });
    expect(repo.save).toHaveBeenCalledWith('role-1', 'ci-A', 'user-5');
    expect(repo.save).toHaveBeenCalledWith('role-1', 'ci-B', 'user-5');
  });

  it('handles an empty ciIds array — only clears, no saves', async () => {
    await handler.execute({ roleId: 'role-1', ciIds: [], createdBy: 'user-1' });
    expect(repo.deleteByRoleId).toHaveBeenCalledWith('role-1');
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('propagates deleteByRoleId errors', async () => {
    vi.mocked(repo.deleteByRoleId).mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({ roleId: 'role-1', ciIds: ['ci-1'], createdBy: 'user-1' }))
      .rejects.toThrow('DB error');
  });

  it('propagates save errors', async () => {
    vi.mocked(repo.save).mockRejectedValue(new Error('save failed'));
    await expect(handler.execute({ roleId: 'role-1', ciIds: ['ci-1'], createdBy: 'user-1' }))
      .rejects.toThrow('save failed');
  });
});

describe('DeleteRoleCIMappingCommandHandler', () => {
  let repo: IRoleCIMappingRepository;
  let handler: DeleteRoleCIMappingCommandHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new DeleteRoleCIMappingCommandHandler(repo);
  });

  it('calls repo.delete with the given id', async () => {
    await handler.execute({ id: 'mapping-1' });
    expect(repo.delete).toHaveBeenCalledWith('mapping-1');
  });

  it('propagates repository errors', async () => {
    vi.mocked(repo.delete).mockRejectedValue(new Error('not found'));
    await expect(handler.execute({ id: 'missing' })).rejects.toThrow('not found');
  });
});
