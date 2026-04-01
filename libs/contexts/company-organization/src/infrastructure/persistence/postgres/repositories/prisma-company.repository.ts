import { getPrisma } from '@whizard/shared-infrastructure';
import type { ICompanyRepository } from '../../../../domain/repositories/company.repository.js';
import type { ContactRole } from '../../../../domain/value-objects/contact-role.vo.js';
import type { MediaRole } from '../../../../domain/value-objects/media-role.vo.js';
import { Company } from '../../../../domain/aggregates/company.aggregate.js';
import { CompanyStatus } from '../../../../domain/value-objects/company-status.vo.js';

export class PrismaCompanyRepository implements ICompanyRepository {
  private get prisma() { return getPrisma(); }

  async findById(id: string): Promise<Company | null> {
    const row = await this.prisma.company.findUnique({
      where: { id },
      include: {
        clubs: true,
        mediaAssets: { orderBy: { sortOrder: 'asc' } },
        contacts: true,
      },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(_tenantId: string, search?: string): Promise<Company[]> {
    const rows = await this.prisma.company.findMany({
      where: {
        isActive: true,
        ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
      },
      include: {
        clubs: true,
        mediaAssets: { orderBy: { sortOrder: 'asc' } },
        contacts: true,
      },
      orderBy: { createdOn: 'desc' },
    });
    return rows.map(r => this.toDomain(r));
  }

  async save(company: Company): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Ensure Tenant record exists (create-only, no update needed)
      await tx.tenant.upsert({
        where: { id: company.tenantId },
        update: {},
        create: { id: company.tenantId, name: company.name, type: 'COMPANY', isActive: true },
      });

      await tx.company.upsert({
        where: { id: company.id },
        update: {
          name: company.name,
          industryId: company.industryId,
          cityId: company.cityId,
          companyType: company.companyType,
          establishedYear: company.establishedYear,
          description: company.description,
          whatWeOffer: company.whatWeOffer,
          awardsRecognition: company.awardsRecognition,
          keyProductsServices: company.keyProductsServices,
          recruitmentHighlights: company.recruitmentHighlights,
          placementStats: company.placementStats,
          inquiryEmail: company.inquiryEmail,
          status: company.status,
          isActive: company.isActive,
          updatedBy: company.createdBy,
        },
        create: {
          id: company.id,
          tenantId: company.tenantId,
          industryId: company.industryId,
          companyCode: company.companyCode,
          name: company.name,
          cityId: company.cityId,
          companyType: company.companyType,
          establishedYear: company.establishedYear,
          description: company.description,
          whatWeOffer: company.whatWeOffer,
          awardsRecognition: company.awardsRecognition,
          keyProductsServices: company.keyProductsServices,
          recruitmentHighlights: company.recruitmentHighlights,
          placementStats: company.placementStats,
          inquiryEmail: company.inquiryEmail,
          status: company.status,
          isActive: company.isActive,
          createdBy: company.createdBy,
        },
      });

      // Sync clubs
      await tx.companyClub.deleteMany({ where: { companyId: company.id } });
      if (company.clubs.length > 0) {
        await tx.companyClub.createMany({
          data: company.clubs.map(c => ({ companyId: company.id, clubId: c.clubId, isParent: c.isParent })),
        });
      }

      // Sync media assets
      await tx.companyMediaAsset.deleteMany({ where: { companyId: company.id } });
      if (company.mediaItems.length > 0) {
        await tx.companyMediaAsset.createMany({
          data: company.mediaItems.map(m => ({
            companyId: company.id,
            mediaAssetId: m.mediaAssetId,
            mediaRole: m.mediaRole,
            sortOrder: m.sortOrder,
          })),
        });
      }

      // Sync contacts
      await tx.companyContact.deleteMany({ where: { companyId: company.id } });
      if (company.contacts.length > 0) {
        await tx.companyContact.createMany({
          data: company.contacts.map(c => ({
            companyId: company.id,
            userId: c.userId,
            contactRole: c.role,
            isActive: true,
            createdBy: company.createdBy,
          })),
        });
      }
    });
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: {
        name: { equals: name, mode: 'insensitive' },
        isActive: true,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return count > 0;
  }

  private toDomain(row: {
    id: string; tenantId: string; industryId: string | null; companyCode: string;
    name: string; cityId: string | null; companyType: string | null;
    establishedYear: number | null; description: string | null;
    whatWeOffer: string | null; awardsRecognition: string | null;
    keyProductsServices: string | null; recruitmentHighlights: string | null;
    placementStats: string | null; inquiryEmail: string | null;
    status: number; isActive: boolean; createdBy: string;
    clubs?: { clubId: string; isParent: boolean }[];
    mediaAssets?: { mediaAssetId: string; mediaRole: string; sortOrder: number }[];
    contacts?: { userId: string; contactRole: string }[];
  }): Company {
    return Company.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      industryId: row.industryId,
      companyCode: row.companyCode,
      name: row.name,
      cityId: row.cityId,
      companyType: row.companyType,
      establishedYear: row.establishedYear,
      description: row.description,
      whatWeOffer: row.whatWeOffer,
      awardsRecognition: row.awardsRecognition,
      keyProductsServices: row.keyProductsServices,
      recruitmentHighlights: row.recruitmentHighlights,
      placementStats: row.placementStats,
      inquiryEmail: row.inquiryEmail,
      status: row.status as CompanyStatus,
      isActive: row.isActive,
      createdBy: row.createdBy,
      clubs: (row.clubs ?? []).map(c => ({ clubId: c.clubId, isParent: c.isParent })),
      mediaItems: (row.mediaAssets ?? []).map(m => ({
        mediaAssetId: m.mediaAssetId,
        mediaRole: m.mediaRole as MediaRole,
        sortOrder: m.sortOrder,
      })),
      contacts: (row.contacts ?? []).map(c => ({
        userId: c.userId,
        role: c.contactRole as ContactRole,
      })),
    });
  }
}
