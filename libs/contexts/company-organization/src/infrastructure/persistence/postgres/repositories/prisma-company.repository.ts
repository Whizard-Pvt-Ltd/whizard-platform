import { getPrisma } from '@whizard/shared-infrastructure';
import type { ICompanyRepository } from '../../../../domain/repositories/company.repository.js';
import type { ContactRole } from '../../../../domain/value-objects/contact-role.vo.js';
import type { MediaRole } from '../../../../domain/value-objects/media-role.vo.js';
import { Company } from '../../../../domain/aggregates/company.aggregate.js';
import { CompanyStatus } from '../../../../domain/value-objects/company-status.vo.js';

interface CompanyRow {
  id: bigint;
  tenantId: bigint;
  industryId: bigint | null;
  cityId: bigint | null;
  companyCode: string;
  name: string;
  companyType: string | null;
  establishedYear: number | null;
  description: string | null;
  whatWeOffer: string | null;
  awardsRecognition: string | null;
  keyProductsServices: string | null;
  recruitmentHighlights: string | null;
  placementStats: string | null;
  inquiryEmail: string | null;
  status: number;
  isActive: boolean;
  clubs?: { clubId: bigint; isParent: boolean }[];
  mediaAssets?: { mediaAssetId: bigint; mediaRole: string; sortOrder: number }[];
  contacts?: { userId: bigint; contactRole: string }[];
}

const companyInclude = {
  clubs: { select: { clubId: true, isParent: true } },
  mediaAssets: { select: { mediaAssetId: true, mediaRole: true, sortOrder: true }, orderBy: { sortOrder: 'asc' as const } },
  contacts: true,
} as const;

export class PrismaCompanyRepository implements ICompanyRepository {
  private get prisma() { return getPrisma(); }

  async findById(id: string): Promise<Company | null> {
    const row = await this.prisma.company.findUnique({
      where: { id: BigInt(id) },
      include: companyInclude,
    });
    if (!row) return null;
    return this.toDomain(row as unknown as CompanyRow);
  }

  async findAll(_tenantId: string, search?: string): Promise<Company[]> {
    const rows = await this.prisma.company.findMany({
      where: {
        isActive: true,
        ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
      },
      include: companyInclude,
      orderBy: { createdOn: 'desc' },
    });
    return rows.map(r => this.toDomain(r as unknown as CompanyRow));
  }

  async save(company: Company): Promise<string> {
    const dbRecord = await this.prisma.$transaction(async (tx) => {
      const industryId = company.industryId ? BigInt(company.industryId) : null;
      const cityId = company.cityId ? BigInt(company.cityId) : null;

      // Ensure Tenant record exists for new companies (tenantId='0' means auto-create)
      let tenantId: bigint;
      if (company.tenantId === '0') {
        const newTenant = await tx.tenant.create({
          data: { name: company.name, type: 'COMPANY', isActive: true },
          select: { id: true },
        });
        tenantId = newTenant.id;
      } else {
        tenantId = BigInt(company.tenantId);
      }

      const dbCompany = await tx.company.upsert({
        where: { id: BigInt(company.id) },
        update: {
          name: company.name,
          industryId,
          cityId,
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
        },
        create: {
          tenantId,
          industryId,
          companyCode: company.companyCode,
          name: company.name,
          cityId,
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
          createdBy: BigInt(0),
        },
        select: { id: true },
      });

      const companyId = dbCompany.id;

      // Sync clubs
      await tx.companyClub.deleteMany({ where: { companyId } });
      if (company.clubs.length > 0) {
        await tx.companyClub.createMany({
          data: company.clubs.map(c => ({
            companyId,
            clubId: BigInt(c.clubId),
            isParent: c.isParent,
          })),
        });
      }

      // Sync media assets
      await tx.companyMediaAsset.deleteMany({ where: { companyId } });
      if (company.mediaItems.length > 0) {
        await tx.companyMediaAsset.createMany({
          data: company.mediaItems.map(m => ({
            companyId,
            mediaAssetId: BigInt(m.mediaAssetId),
            mediaRole: m.mediaRole,
            sortOrder: m.sortOrder,
          })),
        });
      }

      // Sync contacts
      await tx.companyContact.deleteMany({ where: { companyId } });
      if (company.contacts.length > 0) {
        await tx.companyContact.createMany({
          data: company.contacts.map(c => ({
            companyId,
            userId: BigInt(c.userId),
            contactRole: c.role,
            isActive: true,
            createdBy: BigInt(0),
          })),
        });
      }

      return dbCompany;
    });

    return dbRecord.id.toString();
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: {
        name: { equals: name, mode: 'insensitive' },
        isActive: true,
        ...(excludeId && { id: { not: BigInt(excludeId) } }),
      },
    });
    return count > 0;
  }

  private toDomain(row: CompanyRow): Company {
    return Company.reconstitute({
      id: row.id.toString(),
      tenantId: row.tenantId.toString(),
      industryId: row.industryId?.toString() ?? null,
      companyCode: row.companyCode,
      name: row.name,
      cityId: row.cityId?.toString() ?? null,
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
      createdBy: '',
      clubs: (row.clubs ?? []).map(c => ({ clubId: c.clubId.toString(), isParent: c.isParent })),
      mediaItems: (row.mediaAssets ?? []).map(m => ({
        mediaAssetId: m.mediaAssetId.toString(),
        mediaRole: m.mediaRole as MediaRole,
        sortOrder: m.sortOrder,
      })),
      contacts: (row.contacts ?? []).map(c => ({
        userId: c.userId.toString(),
        role: c.contactRole as ContactRole,
      })),
    });
  }
}
