import type { ICollegeRepository } from '../../domain/repositories/college.repository.js';
import type { CollegeListItemDto } from '../dto/college.dto.js';
import { toCollegeListItemDto } from '../mappers/college.mapper.js';

export interface ListCollegesQuery {
  tenantId: string;
  search?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export class ListCollegesQueryHandler {
  constructor(private readonly collegeRepo: ICollegeRepository) {}

  async execute(query: ListCollegesQuery): Promise<{ items: CollegeListItemDto[]; total: number }> {
    const { items, total } = await this.collegeRepo.findAll({
      tenantId: query.tenantId,
      search: query.search,
      status: query.status,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });

    return {
      items: items.map(c => toCollegeListItemDto(c, null, null)),
      total,
    };
  }
}
