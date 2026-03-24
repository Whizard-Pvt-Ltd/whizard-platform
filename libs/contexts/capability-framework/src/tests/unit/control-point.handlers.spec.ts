import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ControlPoint } from '../../domain/aggregates/control-point.aggregate';
import type { IControlPointRepository } from '../../domain/repositories/control-point.repository';
import {
  CreateControlPointCommandHandler,
  UpdateControlPointCommandHandler,
  DeleteControlPointCommandHandler
} from '../../application/command-handlers/control-point.handlers';
import { DomainException } from '../../application/domain-exception';

const makeRepo = (): IControlPointRepository => ({
  findByTaskId: vi.fn(),
  findAllDtos: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
});

const createCmd = {
  tenantId: 'tenant-1',
  taskId: 'task-1',
  name: 'Pressure within threshold',
  riskLevel: 'High',
  failureImpactType: 'Safety',
  escalationRequired: 'Yes',
  evidenceType: 'Log'
};

describe('CreateControlPointCommandHandler', () => {
  let repo: IControlPointRepository;
  let handler: CreateControlPointCommandHandler;

  beforeEach(() => {
    repo = makeRepo();
    handler = new CreateControlPointCommandHandler(repo);
  });

  it('saves a new ControlPoint aggregate', async () => {
    await handler.execute(createCmd);
    expect(repo.save).toHaveBeenCalledOnce();
    const saved = vi.mocked(repo.save).mock.calls[0][0];
    expect(saved).toBeInstanceOf(ControlPoint);
    expect(saved.name).toBe('Pressure within threshold');
    expect(saved.taskId).toBe('task-1');
    expect(saved.tenantId).toBe('tenant-1');
    expect(saved.riskLevel).toBe('High');
    expect(saved.evidenceType).toBe('Log');
  });

  it('forwards optional fields to the aggregate', async () => {
    await handler.execute({ ...createCmd, description: 'Some desc', kpiThreshold: '< 5%' });
    const saved = vi.mocked(repo.save).mock.calls[0][0];
    expect(saved.description).toBe('Some desc');
    expect(saved.kpiThreshold).toBe('< 5%');
  });

  it('propagates repository errors', async () => {
    vi.mocked(repo.save).mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(createCmd)).rejects.toThrow('DB error');
  });
});

describe('UpdateControlPointCommandHandler', () => {
  let repo: IControlPointRepository;
  let handler: UpdateControlPointCommandHandler;
  let existingCp: ControlPoint;

  beforeEach(() => {
    repo = makeRepo();
    handler = new UpdateControlPointCommandHandler(repo);
    existingCp = ControlPoint.reconstitute({ id: 'cp-1', ...createCmd });
  });

  it('updates and persists the control point', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingCp);
    await handler.execute({ id: 'cp-1', tenantId: 'tenant-1', riskLevel: 'Critical', escalationRequired: 'No' });
    expect(repo.update).toHaveBeenCalledOnce();
    const updated = vi.mocked(repo.update).mock.calls[0][0];
    expect(updated.riskLevel).toBe('Critical');
    expect(updated.escalationRequired).toBe('No');
    expect(updated.failureImpactType).toBe('Safety');
  });

  it('throws DomainException when control point not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost-id', tenantId: 'tenant-1' }))
      .rejects.toThrow(DomainException);
  });

  it('throws DomainException with descriptive message', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost-id', tenantId: 'tenant-1' }))
      .rejects.toThrow('ControlPoint ghost-id not found');
  });
});

describe('DeleteControlPointCommandHandler', () => {
  let repo: IControlPointRepository;
  let handler: DeleteControlPointCommandHandler;
  let existingCp: ControlPoint;

  beforeEach(() => {
    repo = makeRepo();
    handler = new DeleteControlPointCommandHandler(repo);
    existingCp = ControlPoint.reconstitute({ id: 'cp-1', ...createCmd });
  });

  it('deletes the control point from the repository', async () => {
    vi.mocked(repo.findById).mockResolvedValue(existingCp);
    await handler.execute({ id: 'cp-1', tenantId: 'tenant-1' });
    expect(repo.delete).toHaveBeenCalledWith('cp-1');
  });

  it('throws DomainException when control point not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(handler.execute({ id: 'ghost-id', tenantId: 'tenant-1' }))
      .rejects.toThrow(DomainException);
  });
});
