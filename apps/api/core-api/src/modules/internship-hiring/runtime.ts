import {
  PrismaInternshipRepository,
  CreateInternshipCommandHandler,
  UpdateInternshipCommandHandler,
  PublishInternshipCommandHandler,
  ArchiveInternshipCommandHandler,
  UploadInternshipFileCommandHandler,
  ListInternshipsQueryHandler,
  GetInternshipByIdQueryHandler,
} from '@whizard/internship-hiring';
import { S3StorageAdapter } from '@whizard/shared-infrastructure';
import type { FastifyInstanceLike } from '../iam/shared/request-context';
import { registerInternshipHiringModule } from './internship-hiring.module';

export interface InternshipHiringModuleDependencies {
  readonly createInternship: CreateInternshipCommandHandler;
  readonly updateInternship: UpdateInternshipCommandHandler;
  readonly publishInternship: PublishInternshipCommandHandler;
  readonly archiveInternship: ArchiveInternshipCommandHandler;
  readonly uploadInternshipFile: UploadInternshipFileCommandHandler;
  readonly listInternships: ListInternshipsQueryHandler;
  readonly getInternshipById: GetInternshipByIdQueryHandler;
}

export const registerInternshipHiringCoreApiRuntime = async (app: FastifyInstanceLike): Promise<void> => {
  const repo    = new PrismaInternshipRepository();
  const storage = new S3StorageAdapter();

  const deps: InternshipHiringModuleDependencies = {
    createInternship:    new CreateInternshipCommandHandler(repo),
    updateInternship:    new UpdateInternshipCommandHandler(repo),
    publishInternship:   new PublishInternshipCommandHandler(repo),
    archiveInternship:   new ArchiveInternshipCommandHandler(repo),
    uploadInternshipFile: new UploadInternshipFileCommandHandler(storage),
    listInternships:     new ListInternshipsQueryHandler(repo),
    getInternshipById:   new GetInternshipByIdQueryHandler(repo),
  };

  await registerInternshipHiringModule(app, deps);
};
