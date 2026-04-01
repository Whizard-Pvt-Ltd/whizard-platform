import {
  PrismaCompanyRepository,
  PrismaMediaAssetRepository,
  CreateCompanyCommandHandler,
  UpdateCompanyCommandHandler,
  PublishCompanyCommandHandler,
  UploadMediaAssetCommandHandler,
  ListCompaniesQueryHandler,
  GetCompanyByIdQueryHandler,
  ListClubsQueryHandler,
  ListIndustriesQueryHandler,
  ListCitiesQueryHandler,
  ListUsersForContactsQueryHandler,
} from '@whizard/company-organization';
import { S3StorageAdapter } from '@whizard/shared-infrastructure';
import type { FastifyInstanceLike } from '../iam/shared/request-context';
import { registerCompanyOrganizationModule } from './company-organization.module';

export interface CompanyOrganizationModuleDependencies {
  readonly createCompany: CreateCompanyCommandHandler;
  readonly updateCompany: UpdateCompanyCommandHandler;
  readonly publishCompany: PublishCompanyCommandHandler;
  readonly uploadMediaAsset: UploadMediaAssetCommandHandler;
  readonly listCompanies: ListCompaniesQueryHandler;
  readonly getCompanyById: GetCompanyByIdQueryHandler;
  readonly listClubs: ListClubsQueryHandler;
  readonly listIndustries: ListIndustriesQueryHandler;
  readonly listCities: ListCitiesQueryHandler;
  readonly listUsersForContacts: ListUsersForContactsQueryHandler;
}

export const registerCompanyOrganizationCoreApiRuntime = async (app: FastifyInstanceLike): Promise<void> => {
  const companyRepo = new PrismaCompanyRepository();
  const mediaRepo   = new PrismaMediaAssetRepository();
  const storage     = new S3StorageAdapter();

  const deps: CompanyOrganizationModuleDependencies = {
    createCompany:      new CreateCompanyCommandHandler(companyRepo),
    updateCompany:      new UpdateCompanyCommandHandler(companyRepo),
    publishCompany:     new PublishCompanyCommandHandler(companyRepo),
    uploadMediaAsset:   new UploadMediaAssetCommandHandler(mediaRepo, storage),
    listCompanies:      new ListCompaniesQueryHandler(companyRepo),
    getCompanyById:     new GetCompanyByIdQueryHandler(companyRepo),
    listClubs:          new ListClubsQueryHandler(),
    listIndustries:     new ListIndustriesQueryHandler(),
    listCities:         new ListCitiesQueryHandler(),
    listUsersForContacts: new ListUsersForContactsQueryHandler(),
  };

  await registerCompanyOrganizationModule(app, deps);
};
