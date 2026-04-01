import { getPrisma } from '@whizard/shared-infrastructure';
import type { ICollegeRepository, CollegeListFilter } from '../../../../domain/repositories/college.repository.js';
import type { ContactRole } from '../../../../domain/value-objects/contact-role.vo.js';
import type { MediaRole } from '../../../../domain/value-objects/media-role.vo.js';
import { College } from '../../../../domain/aggregates/college.aggregate.js';
import { CollegeStatus } from '../../../../domain/value-objects/college-status.vo.js';

interface CollegeRow {
  id: bigint;
  tenantId: bigint;
  cityId: bigint | null;
  collegeCode: string;
  name: string;
  affiliatedUniversity: string;
  collegeType: string;
  establishedYear: number | null;
  description: string | null;
  degreesOffered: string | null;
  placementHighlights: string | null;
  inquiryEmail: string | null;
  status: number;
  isActive: boolean;
  clubs?: { clubId: bigint }[];
  degreePrograms?: { programId: bigint }[];
  mediaAssets?: { mediaAssetId: bigint; mediaRole: string; sortOrder: number }[];
  contacts?: { userId: bigint; role: string }[];
}

const collegeInclude = {
  clubs: { select: { clubId: true } },
  degreePrograms: { select: { programId: true } },
  mediaAssets: { select: { mediaAssetId: true, mediaRole: true, sortOrder: true }, orderBy: { sortOrder: 'asc' as const } },
  contacts: true,
} as const;

export class PrismaCollegeRepository implements ICollegeRepository {
  private get prisma() { return getPrisma(); }

  async findById(id: string): Promise<College | null> {
    const row = await this.prisma.college.findUnique({
      where: { id: BigInt(id) },
      include: collegeInclude,
    });
    if (!row) return null;
    return this.toDomain(row as unknown as CollegeRow);
  }

  async findAll(filter: CollegeListFilter): Promise<{ items: College[]; total: number }> {
    const { tenantId, search, status, page = 1, pageSize = 20 } = filter;
    const skip = (page - 1) * pageSize;

    const where = {
      tenantId: BigInt(tenantId),
      isActive: true,
      ...(status !== undefined && { status }),
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };

    const [rows, total] = await Promise.all([
      this.prisma.college.findMany({
        where,
        include: collegeInclude,
        orderBy: { createdOn: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.college.count({ where }),
    ]);

    return { items: rows.map(r => this.toDomain(r as unknown as CollegeRow)), total };
  }

  async save(college: College): Promise<string> {
    const dbRecord = await this.prisma.$transaction(async (tx) => {
      const tenantId = BigInt(college.tenantId);
      const cityId = college.cityId ? BigInt(college.cityId) : null;

      const dbCollege = await tx.college.upsert({
        where: { id: BigInt(college.id) },
        update: {
          name: college.name,
          affiliatedUniversity: college.affiliatedUniversity,
          cityId,
          collegeType: college.collegeType,
          establishedYear: college.establishedYear,
          description: college.description,
          degreesOffered: college.degreesOffered,
          placementHighlights: college.placementHighlights,
          inquiryEmail: college.inquiryEmail,
          status: college.status,
          isActive: college.isActive,
        },
        create: {
          tenantId,
          collegeCode: college.collegeCode,
          name: college.name,
          affiliatedUniversity: college.affiliatedUniversity,
          cityId,
          collegeType: college.collegeType,
          establishedYear: college.establishedYear,
          description: college.description,
          degreesOffered: college.degreesOffered,
          placementHighlights: college.placementHighlights,
          inquiryEmail: college.inquiryEmail,
          status: college.status,
          isActive: college.isActive,
          createdBy: BigInt(0),
        },
        select: { id: true },
      });

      const collegeId = dbCollege.id;

      // Sync clubs
      await tx.clubCollege.deleteMany({ where: { collegeId } });
      if (college.clubIds.length > 0) {
        await tx.clubCollege.createMany({
          data: college.clubIds.map(id => ({ collegeId, clubId: BigInt(id) })),
        });
      }

      // Sync degree programs
      await tx.collegeDegreeProgram.deleteMany({ where: { collegeId } });
      if (college.programIds.length > 0) {
        await tx.collegeDegreeProgram.createMany({
          data: college.programIds.map(id => ({ collegeId, programId: BigInt(id) })),
        });
      }

      // Sync media assets
      await tx.collegeMediaAsset.deleteMany({ where: { collegeId } });
      if (college.mediaItems.length > 0) {
        await tx.collegeMediaAsset.createMany({
          data: college.mediaItems.map(m => ({
            collegeId,
            mediaAssetId: BigInt(m.mediaAssetId),
            mediaRole: m.mediaRole,
            sortOrder: m.sortOrder,
          })),
        });
      }

      // Sync contacts
      await tx.collegeContact.deleteMany({ where: { collegeId } });
      if (college.contacts.length > 0) {
        await tx.collegeContact.createMany({
          data: college.contacts.map(c => ({
            collegeId,
            userId: BigInt(c.userId),
            role: c.role,
            createdBy: BigInt(0),
          })),
        });
      }

      return dbCollege;
    });

    return dbRecord.id.toString();
  }

  async existsByName(tenantId: string, name: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.college.count({
      where: {
        tenantId: BigInt(tenantId),
        name: { equals: name, mode: 'insensitive' },
        isActive: true,
        ...(excludeId && { id: { not: BigInt(excludeId) } }),
      },
    });
    return count > 0;
  }

  private toDomain(row: CollegeRow): College {
    return College.reconstitute({
      id: row.id.toString(),
      tenantId: row.tenantId.toString(),
      collegeCode: row.collegeCode,
      name: row.name,
      affiliatedUniversity: row.affiliatedUniversity,
      cityId: row.cityId?.toString() ?? null,
      collegeType: row.collegeType,
      establishedYear: row.establishedYear,
      description: row.description,
      degreesOffered: row.degreesOffered,
      placementHighlights: row.placementHighlights,
      inquiryEmail: row.inquiryEmail,
      status: row.status as unknown as CollegeStatus,
      isActive: row.isActive,
      createdBy: '',
      clubIds: (row.clubs ?? []).map(c => c.clubId.toString()),
      programIds: (row.degreePrograms ?? []).map(p => p.programId.toString()),
      mediaItems: (row.mediaAssets ?? []).map(m => ({
        mediaAssetId: m.mediaAssetId.toString(),
        mediaRole: m.mediaRole as MediaRole,
        sortOrder: m.sortOrder,
      })),
      contacts: (row.contacts ?? []).map(c => ({
        userId: c.userId.toString(),
        role: c.role as ContactRole,
      })),
    });
  }
}
