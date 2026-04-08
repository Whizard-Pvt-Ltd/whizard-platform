import type { IControlPointRepository } from '../../domain/repositories/control-point.repository';
import type { ControlPointDto } from '../dto/control-point.dto';

export class ListControlPointsQueryHandler {
  constructor(private readonly repo: IControlPointRepository) {}

  async execute(taskId: string, tenantId?: string): Promise<ControlPointDto[]> {
    return this.repo.findAllDtos(taskId, tenantId);
  }
}
