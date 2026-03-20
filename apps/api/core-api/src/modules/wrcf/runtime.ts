import type { FastifyInstanceLike } from '../iam/shared/request-context';
import {
  PrismaFunctionalGroupRepository,
  PrismaPwoRepository,
  PrismaSwoRepository,
  PrismaCapabilityRepository,
  PrismaProficiencyRepository,
  PrismaIndustrySectorRepository,
  PrismaIndustryRepository,
  ListSectorsQueryHandler,
  ListIndustriesQueryHandler,
  ListFGsQueryHandler,
  ListPWOsQueryHandler,
  ListSWOsQueryHandler,
  ListCapabilitiesQueryHandler,
  ListProficienciesQueryHandler,
  CreateFGCommandHandler,
  UpdateFGCommandHandler,
  DeactivateFGCommandHandler,
  CreatePWOCommandHandler,
  UpdatePWOCommandHandler,
  DeactivatePWOCommandHandler,
  CreateSWOCommandHandler,
  UpdateSWOCommandHandler,
  DeactivateSWOCommandHandler
} from '@whizard/capability-framework';
import { registerWrcfModule } from './wrcf.module';

export interface WrcfModuleDependencies {
  readonly listSectors: ListSectorsQueryHandler;
  readonly listIndustries: ListIndustriesQueryHandler;
  readonly listFGs: ListFGsQueryHandler;
  readonly listPWOs: ListPWOsQueryHandler;
  readonly listSWOs: ListSWOsQueryHandler;
  readonly listCapabilities: ListCapabilitiesQueryHandler;
  readonly listProficiencies: ListProficienciesQueryHandler;
  readonly createFG: CreateFGCommandHandler;
  readonly updateFG: UpdateFGCommandHandler;
  readonly deactivateFG: DeactivateFGCommandHandler;
  readonly createPWO: CreatePWOCommandHandler;
  readonly updatePWO: UpdatePWOCommandHandler;
  readonly deactivatePWO: DeactivatePWOCommandHandler;
  readonly createSWO: CreateSWOCommandHandler;
  readonly updateSWO: UpdateSWOCommandHandler;
  readonly deactivateSWO: DeactivateSWOCommandHandler;
}

export const registerWrcfCoreApiRuntime = async (app: FastifyInstanceLike): Promise<void> => {
  const fgRepo = new PrismaFunctionalGroupRepository();
  const pwoRepo = new PrismaPwoRepository();
  const swoRepo = new PrismaSwoRepository();
  const capRepo = new PrismaCapabilityRepository();
  const profRepo = new PrismaProficiencyRepository();
  const sectorRepo = new PrismaIndustrySectorRepository();
  const industryRepo = new PrismaIndustryRepository();

  const deps: WrcfModuleDependencies = {
    listSectors: new ListSectorsQueryHandler(sectorRepo),
    listIndustries: new ListIndustriesQueryHandler(industryRepo),
    listFGs: new ListFGsQueryHandler(fgRepo),
    listPWOs: new ListPWOsQueryHandler(pwoRepo),
    listSWOs: new ListSWOsQueryHandler(swoRepo),
    listCapabilities: new ListCapabilitiesQueryHandler(capRepo),
    listProficiencies: new ListProficienciesQueryHandler(profRepo),
    createFG: new CreateFGCommandHandler(fgRepo),
    updateFG: new UpdateFGCommandHandler(fgRepo),
    deactivateFG: new DeactivateFGCommandHandler(fgRepo),
    createPWO: new CreatePWOCommandHandler(pwoRepo),
    updatePWO: new UpdatePWOCommandHandler(pwoRepo),
    deactivatePWO: new DeactivatePWOCommandHandler(pwoRepo),
    createSWO: new CreateSWOCommandHandler(swoRepo),
    updateSWO: new UpdateSWOCommandHandler(swoRepo),
    deactivateSWO: new DeactivateSWOCommandHandler(swoRepo)
  };

  await registerWrcfModule(app, deps);
};
