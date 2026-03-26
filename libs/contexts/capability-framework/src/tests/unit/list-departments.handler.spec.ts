import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IDepartmentRepository } from '../../domain/repositories/department.repository';
import { ListDepartmentsQueryHandler } from '../../application/query-handlers/list-departments.handler';

const makeRepo = (): IDepartmentRepository => ({
  findByIndustryId: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
});

const deptDto = (overrides = {}) => ({
  id: 'dept-1',
  name: 'Engineering',
  industryId: 'industry-1',
  fgIds: ['fg-1', 'fg-2'],
  ...overrides
});

describe('ListDepartmentsQueryHandler', () => {
  let repo: IDepartmentRepository;
  let handler: ListDepartmentsQueryHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new ListDepartmentsQueryHandler(repo);
  });

  it('delegates to findByIndustryId with correct tenantId and industryId', async () => {
    vi.mocked(repo.findByIndustryId).mockResolvedValue([]);
    await handler.execute('tenant-1', 'industry-1');
    expect(repo.findByIndustryId).toHaveBeenCalledWith('tenant-1', 'industry-1');
  });

  it('returns the list of department dtos from the repository', async () => {
    const dtos = [deptDto(), deptDto({ id: 'dept-2', name: 'Operations' })];
    vi.mocked(repo.findByIndustryId).mockResolvedValue(dtos);

    const result = await handler.execute('tenant-1', 'industry-1');

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Engineering');
    expect(result[1].name).toBe('Operations');
  });

  it('returns an empty array when no departments exist for the industry', async () => {
    vi.mocked(repo.findByIndustryId).mockResolvedValue([]);
    const result = await handler.execute('tenant-1', 'industry-empty');
    expect(result).toEqual([]);
  });

  it('includes fgIds in the returned dtos', async () => {
    vi.mocked(repo.findByIndustryId).mockResolvedValue([deptDto({ fgIds: ['fg-A', 'fg-B'] })]);
    const result = await handler.execute('tenant-1', 'industry-1');
    expect(result[0].fgIds).toEqual(['fg-A', 'fg-B']);
  });

  it('propagates repository errors', async () => {
    vi.mocked(repo.findByIndustryId).mockRejectedValue(new Error('DB error'));
    await expect(handler.execute('tenant-1', 'industry-1')).rejects.toThrow('DB error');
  });
});
