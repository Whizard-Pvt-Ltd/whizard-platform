import type { IClubRepository } from '../../domain/repositories/club.repository.js';
import type { ClubDto } from '../dto/college.dto.js';

export interface ListClubsQuery {
  tenantId: string;
}

export class ListClubsQueryHandler {
  constructor(private readonly clubRepo: IClubRepository) {}

  async execute(query: ListClubsQuery): Promise<ClubDto[]> {
    const clubs = await this.clubRepo.findAll(query.tenantId);
    return clubs.map(c => ({ id: c.id, name: c.name, description: c.description, logoUrl: c.logoUrl }));
  }
}
