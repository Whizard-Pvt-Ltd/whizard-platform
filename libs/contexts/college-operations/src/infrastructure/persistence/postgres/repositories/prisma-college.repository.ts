import { getPrisma } from '@whizard/shared-infrastructure';
import type { ICollegeRepository, CollegeListFilter } from '../../../../domain/repositories/college.repository.js';
import type { ContactRole } from '../../../../domain/value-objects/contact-role.vo.js';
import type { MediaRole } from '../../../../domain/value-objects/media-role.vo.js';
import { College } from '../../../../domain/aggregates/college.aggregate.js';
import { CollegeStatus } from '../../../../domain/value-objects/college-status.vo.js';

interface CollegeRow {
  id: string;
  tenantId: string;
  collegeCode: string;
  name: string;
  affiliatedUniversity: string;
  cityId: string | null;
  collegeType: string;
  establishedYear: number | null;
  description: string | null;
  degreesOffered: string | null;
  placementHighlights: string | null;
  inquiryEmail: string | null;
  status: number;
  isActive: boolean;
  createdBy: string;
  clubs?: { clubId: string }[];
  degreePrograms?: { programId: string }[];
  mediaAssets?: { mediaAssetId: string; mediaRole: string; sortOrder: number }[];
  contacts?: { userId: string; role: string }[];
}

export class PrismaCollegeRepository implements ICollegeRepository {
  private get prisma() { return getPrisma(); }

  async findById(id: string): Promise<College | null> {
    const row = await this.prisma.college.findUnique({
      where: { id },
      include: {
        clubs: true,
        degreePrograms: true,
        mediaAssets: { orderBy: { sortOrder: 'asc' } },
        contacts: true,
      },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(filter: CollegeListFilter): Promise<{ items: College[]; total: number }> {
    const { tenantId, search, status, page = 1, pageSize = 20 } = filter;
    const skip = (page - 1) * pageSize;

    const where = {
      tenantId,
      isActive: true,
      ...(status !== undefined && { status }),
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };

    const [rows, total] = await Promise.all([
      this.prisma.college.findMany({
        where,
        include: {
          clubs: true,
          degreePrograms: true,
          mediaAssets: { orderBy: { sortOrder: 'asc' } },
          contacts: true,
        },
        orderBy: { createdOn: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.college.count({ where }),
    ]);

    return { items: rows.map(r => this.toDomain(r)), total };
  }

  async save(college: College): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.college.upsert({
        where: { id: college.id },
        update: {
          name: college.name,
          affiliatedUniversity: college.affiliatedUniversity,
          cityId: college.cityId,
          collegeType: college.collegeType,
          establishedYear: college.establishedYear,
          description: college.description,
          degreesOffered: college.degreesOffered,
          placementHighlights: college.placementHighlights,
          inquiryEmail: college.inquiryEmail,
          status: college.status,
          isActive: college.isActive,
          updatedBy: college.createdBy,
        },
        create: {
          id: college.id,
          tenantId: college.tenantId,
          collegeCode: college.collegeCode,
          name: college.name,
          affiliatedUniversity: college.affiliatedUniversity,
          cityId: college.cityId,
          collegeType: college.collegeType,
          establishedYear: college.establishedYear,
          description: college.description,
          degreesOffered: college.degreesOffered,
          placementHighlights: college.placementHighlights,
          inquiryEmail: college.inquiryEmail,
          status: college.status,
          isActive: college.isActive,
          createdBy: college.createdBy,
        },
      });

      // Sync clubs
      await tx.clubCollege.deleteMany({ where: { collegeId: college.id } });
      if (college.clubIds.length > 0) {
        await tx.clubCollege.createMany({
          data: college.clubIds.map(clubId => ({ collegeId: college.id, clubId })),
        });
      }

      // Sync degree programs
      await tx.collegeDegreeProgram.deleteMany({ where: { collegeId: college.id } });
      if (college.programIds.length > 0) {
        await tx.collegeDegreeProgram.createMany({
          data: college.programIds.map(programId => ({ collegeId: college.id, programId })),
        });
      }

      // Sync media assets
      await tx.collegeMediaAsset.deleteMany({ where: { collegeId: college.id } });
      if (college.mediaItems.length > 0) {
        await tx.collegeMediaAsset.createMany({
          data: college.mediaItems.map(m => ({
            collegeId: college.id,
            mediaAssetId: m.mediaAssetId,
            mediaRole: m.mediaRole,
            sortOrder: m.sortOrder,
          })),
        });
      }

      // Sync contacts
      await tx.collegeContact.deleteMany({ where: { collegeId: college.id } });
      if (college.contacts.length > 0) {
        await tx.collegeContact.createMany({
          data: college.contacts.map(c => ({
            collegeId: college.id,
            userId: c.userId,
            role: c.role,
            createdBy: college.createdBy,
          })),
        });
      }
    });
  }

  async existsByName(tenantId: string, name: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.college.count({
      where: {
        tenantId,
        name: { equals: name, mode: 'insensitive' },
        isActive: true,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return count > 0;
  }

  private toDomain(row: CollegeRow): College {
    return College.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      collegeCode: row.collegeCode,
      name: row.name,
      affiliatedUniversity: row.affiliatedUniversity,
      cityId: row.cityId,
      collegeType: row.collegeType,
      establishedYear: row.establishedYear,
      description: row.description,
      degreesOffered: row.degreesOffered,
      placementHighlights: row.placementHighlights,
      inquiryEmail: row.inquiryEmail,
      status: row.status as unknown as CollegeStatus,
      isActive: row.isActive,
      createdBy: row.createdBy,
      clubIds: (row.clubs ?? []).map((c) => c.clubId),
      programIds: (row.degreePrograms ?? []).map((p) => p.programId),
      mediaItems: (row.mediaAssets ?? []).map((m) => ({
        mediaAssetId: m.mediaAssetId,
        mediaRole: m.mediaRole as MediaRole,
        sortOrder: m.sortOrder,
      })),
      contacts: (row.contacts ?? []).map((c) => ({
        userId: c.userId,
        role: c.role as ContactRole,
      })),
    });
  }
}
