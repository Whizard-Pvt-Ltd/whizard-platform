import { getPrisma } from '@whizard/shared-infrastructure';
import type { ICollegeRepository } from '../../domain/repositories/college.repository.js';
import type { CollegeDetailDto } from '../dto/college.dto.js';
import { toCollegeDetailDto } from '../mappers/college.mapper.js';

export interface GetCollegeByIdQuery {
  collegeId: string;
}

export class GetCollegeByIdQueryHandler {
  constructor(private readonly collegeRepo: ICollegeRepository) {}

  async execute(query: GetCollegeByIdQuery): Promise<CollegeDetailDto> {
    const college = await this.collegeRepo.findById(query.collegeId);
    if (!college) {
      throw Object.assign(new Error(`College ${query.collegeId} not found`), { name: 'DomainException' });
    }

    const prisma = getPrisma();

    const [cityRow, userRows] = await Promise.all([
      college.cityId
        ? prisma.city.findUnique({ where: { id: BigInt(college.cityId) }, select: { name: true } })
        : Promise.resolve(null),
      college.contacts.length > 0
        ? prisma.userAccount.findMany({
            where: { id: { in: college.contacts.map(c => BigInt(c.userId)) } },
            select: { id: true, primaryEmail: true },
          })
        : Promise.resolve([]),
    ]);

    const userMap = new Map(
      userRows.map(u => [
        u.id.toString(),
        { displayName: u.primaryEmail.split('@')[0] ?? u.primaryEmail, email: u.primaryEmail },
      ]),
    );

    return toCollegeDetailDto(college, cityRow?.name ?? null, userMap);
  }
}
