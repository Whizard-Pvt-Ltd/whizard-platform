import { getPrisma } from '@whizard/shared-infrastructure';
import type { ICollegeRepository } from '../../domain/repositories/college.repository.js';
import type { UpdateCollegeCommand } from '../commands/update-college.command.js';
import type { CollegeDetailDto } from '../dto/college.dto.js';
import { toCollegeDetailDto } from '../mappers/college.mapper.js';

export class UpdateCollegeCommandHandler {
  constructor(private readonly collegeRepo: ICollegeRepository) {}

  async execute(cmd: UpdateCollegeCommand): Promise<CollegeDetailDto> {
    const college = await this.collegeRepo.findById(cmd.collegeId);
    if (!college) {
      throw Object.assign(new Error(`College ${cmd.collegeId} not found`), { name: 'DomainException' });
    }

    if (cmd.name && cmd.name !== college.name) {
      const nameExists = await this.collegeRepo.existsByName(cmd.tenantId, cmd.name, cmd.collegeId);
      if (nameExists) {
        throw Object.assign(new Error(`College with name "${cmd.name}" already exists`), { name: 'DomainException' });
      }
    }

    college.update({
      name: cmd.name,
      affiliatedUniversity: cmd.affiliatedUniversity,
      cityId: cmd.cityId,
      collegeType: cmd.collegeType,
      establishedYear: cmd.establishedYear,
      description: cmd.description,
      degreesOffered: cmd.degreesOffered,
      placementHighlights: cmd.placementHighlights,
      inquiryEmail: cmd.inquiryEmail,
      clubIds: cmd.clubIds,
      programIds: cmd.programIds,
      mediaItems: cmd.mediaItems,
      contacts: cmd.contacts,
    });

    await this.collegeRepo.save(college);

    const prisma = getPrisma();
    const effectiveCityId = college.cityId;
    const [cityRow, userRows] = await Promise.all([
      effectiveCityId
        ? prisma.city.findUnique({ where: { id: BigInt(effectiveCityId) }, select: { name: true } })
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
