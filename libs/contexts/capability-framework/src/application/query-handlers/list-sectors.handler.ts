import type { IIndustrySectorRepository } from '../../domain/repositories/industry-sector.repository';
import type { IndustrySectorDto } from '../dto/industry-sector.dto';

export class ListSectorsQueryHandler {
  constructor(private readonly sectorRepo: IIndustrySectorRepository) {}

  async execute(): Promise<IndustrySectorDto[]> {
    const sectors = await this.sectorRepo.findAll();
    return sectors.filter(s => s.isActive);
  }
}
