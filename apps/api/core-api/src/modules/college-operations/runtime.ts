import {
  PrismaCollegeRepository,
  PrismaClubRepository,
  PrismaMediaAssetRepository,
  PrismaDegreeProgramRepository,
  PrismaCityRepository,
  CreateCollegeCommandHandler,
  UpdateCollegeCommandHandler,
  PublishCollegeCommandHandler,
  UploadMediaAssetCommandHandler,
  ListCollegesQueryHandler,
  GetCollegeByIdQueryHandler,
  ListClubsQueryHandler,
  ListDegreeProgramsQueryHandler,
  ListMediaAssetsQueryHandler,
  ListCitiesQueryHandler,
  ListUsersForContactsQueryHandler,
} from '@whizard/college-operations';
import { S3StorageAdapter } from '@whizard/shared-infrastructure';
import type { FastifyInstanceLike } from '../iam/shared/request-context';
import { registerCollegeOperationsModule } from './college-operations.module';

export interface CollegeOperationsModuleDependencies {
  readonly createCollege: CreateCollegeCommandHandler;
  readonly updateCollege: UpdateCollegeCommandHandler;
  readonly publishCollege: PublishCollegeCommandHandler;
  readonly uploadMediaAsset: UploadMediaAssetCommandHandler;
  readonly listColleges: ListCollegesQueryHandler;
  readonly getCollegeById: GetCollegeByIdQueryHandler;
  readonly listClubs: ListClubsQueryHandler;
  readonly listDegreePrograms: ListDegreeProgramsQueryHandler;
  readonly listMediaAssets: ListMediaAssetsQueryHandler;
  readonly listCities: ListCitiesQueryHandler;
  readonly listUsersForContacts: ListUsersForContactsQueryHandler;
}

export const registerCollegeOperationsCoreApiRuntime = async (app: FastifyInstanceLike): Promise<void> => {
  const collegeRepo = new PrismaCollegeRepository();
  const clubRepo = new PrismaClubRepository();
  const mediaRepo = new PrismaMediaAssetRepository();
  const programRepo = new PrismaDegreeProgramRepository();
  const cityRepo = new PrismaCityRepository();
  const storage = new S3StorageAdapter();

  const deps: CollegeOperationsModuleDependencies = {
    createCollege: new CreateCollegeCommandHandler(collegeRepo),
    updateCollege: new UpdateCollegeCommandHandler(collegeRepo),
    publishCollege: new PublishCollegeCommandHandler(collegeRepo),
    uploadMediaAsset: new UploadMediaAssetCommandHandler(mediaRepo, storage),
    listColleges: new ListCollegesQueryHandler(collegeRepo),
    getCollegeById: new GetCollegeByIdQueryHandler(collegeRepo),
    listClubs: new ListClubsQueryHandler(clubRepo),
    listDegreePrograms: new ListDegreeProgramsQueryHandler(programRepo),
    listMediaAssets: new ListMediaAssetsQueryHandler(mediaRepo),
    listCities: new ListCitiesQueryHandler(cityRepo),
    listUsersForContacts: new ListUsersForContactsQueryHandler(),
  };

  await registerCollegeOperationsModule(app, deps);
};
