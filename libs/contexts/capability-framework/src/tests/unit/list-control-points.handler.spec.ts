import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ControlPointDto } from '../../application/dto/control-point.dto';
import type { IControlPointRepository } from '../../domain/repositories/control-point.repository';
import { ListControlPointsQueryHandler } from '../../application/query-handlers/list-control-points.handler';

const makeRepo = (): IControlPointRepository => ({
  findByTaskId: vi.fn(),
  findAllDtos: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
});

const cpDto = (overrides: Partial<ControlPointDto> = {}): ControlPointDto => ({
  id: 'cp-1',
  taskId: 'task-1',
  name: 'Pressure within threshold',
  riskLevel: 'High',
  failureImpactType: 'Safety',
  escalationRequired: 'Yes',
  evidenceType: 'Log',
  ...overrides
});

describe('ListControlPointsQueryHandler', () => {
  let repo: IControlPointRepository;
  let handler: ListControlPointsQueryHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new ListControlPointsQueryHandler(repo);
  });

  it('delegates to findAllDtos with correct tenantId and taskId', async () => {
    vi.mocked(repo.findAllDtos).mockResolvedValue([]);
    await handler.execute('tenant-1', 'task-1');
    expect(repo.findAllDtos).toHaveBeenCalledWith('tenant-1', 'task-1');
  });

  it('returns the list of ControlPointDtos from the repository', async () => {
    const dtos = [
      cpDto(),
      cpDto({ id: 'cp-2', name: 'Temperature check', riskLevel: 'Critical', evidenceType: 'Picture' })
    ];
    vi.mocked(repo.findAllDtos).mockResolvedValue(dtos);

    const result = await handler.execute('tenant-1', 'task-1');

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Pressure within threshold');
    expect(result[1].riskLevel).toBe('Critical');
    expect(result[1].evidenceType).toBe('Picture');
  });

  it('returns an empty array when no control points exist for the task', async () => {
    vi.mocked(repo.findAllDtos).mockResolvedValue([]);
    const result = await handler.execute('tenant-1', 'task-empty');
    expect(result).toEqual([]);
  });

  it('propagates repository errors', async () => {
    vi.mocked(repo.findAllDtos).mockRejectedValue(new Error('DB error'));
    await expect(handler.execute('tenant-1', 'task-1')).rejects.toThrow('DB error');
  });

  it('passes through optional dto fields unchanged', async () => {
    const dto = cpDto({ description: 'Must be within tolerance', kpiThreshold: '< 5%' });
    vi.mocked(repo.findAllDtos).mockResolvedValue([dto]);

    const result = await handler.execute('tenant-1', 'task-1');

    expect(result[0].description).toBe('Must be within tolerance');
    expect(result[0].kpiThreshold).toBe('< 5%');
  });
});
