import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ControlPoint } from '../../domain/aggregates/control-point.aggregate';

const mockPrisma = {
  controlPoint: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn()
  },
  $executeRaw: vi.fn()
};

vi.mock('@whizard/shared-infrastructure', () => ({
  getPrisma: () => mockPrisma
}));

import { PrismaControlPointRepository } from '../../infrastructure/persistence/postgres/repositories/prisma-control-point.repository';

describe('PrismaControlPointRepository.save', () => {
  let repo: PrismaControlPointRepository;
  let controlPoint: ControlPoint;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaControlPointRepository();
    controlPoint = ControlPoint.reconstitute({
      id: '0',
      tenantId: '1',
      taskId: '1',
      name: 'Checkpoint',
      description: 'Control point description',
      riskLevel: 'Medium',
      failureImpactType: 'Quality',
      evidenceType: '',
      kpiThreshold: 95,
      escalationRequired: false
    });
  });

  it('resyncs the sequence and retries once when control point id autoincrement is out of sync', async () => {
    mockPrisma.controlPoint.create
      .mockRejectedValueOnce({ code: 'P2002', meta: { target: ['id'] } })
      .mockResolvedValueOnce(undefined);

    await repo.save(controlPoint);

    expect(mockPrisma.controlPoint.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
  });
});
