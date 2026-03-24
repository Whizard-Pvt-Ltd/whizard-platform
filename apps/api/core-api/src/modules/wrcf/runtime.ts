import type { FastifyInstanceLike } from '../iam/shared/request-context';
import {
  PrismaFunctionalGroupRepository,
  PrismaPwoRepository,
  PrismaSwoRepository,
  PrismaCapabilityRepository,
  PrismaProficiencyRepository,
  PrismaIndustrySectorRepository,
  PrismaIndustryRepository,
  PrismaCapabilityInstanceRepository,
  PrismaSkillRepository,
  PrismaTaskRepository,
  PrismaControlPointRepository,
  ListSectorsQueryHandler,
  ListIndustriesQueryHandler,
  ListFGsQueryHandler,
  ListPWOsQueryHandler,
  ListSWOsQueryHandler,
  ListCapabilitiesQueryHandler,
  ListProficienciesQueryHandler,
  ListCapabilityInstancesQueryHandler,
  ListSkillsQueryHandler,
  ListTasksQueryHandler,
  ListControlPointsQueryHandler,
  CreateFGCommandHandler,
  UpdateFGCommandHandler,
  DeactivateFGCommandHandler,
  CreatePWOCommandHandler,
  UpdatePWOCommandHandler,
  DeactivatePWOCommandHandler,
  CreateSWOCommandHandler,
  UpdateSWOCommandHandler,
  DeactivateSWOCommandHandler,
  CreateCapabilityInstanceCommandHandler,
  DeleteCapabilityInstanceCommandHandler,
  CreateSkillCommandHandler,
  UpdateSkillCommandHandler,
  DeleteSkillCommandHandler,
  CreateTaskCommandHandler,
  UpdateTaskCommandHandler,
  DeleteTaskCommandHandler,
  CreateControlPointCommandHandler,
  UpdateControlPointCommandHandler,
  DeleteControlPointCommandHandler
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
  readonly listCIs: ListCapabilityInstancesQueryHandler;
  readonly createFG: CreateFGCommandHandler;
  readonly updateFG: UpdateFGCommandHandler;
  readonly deactivateFG: DeactivateFGCommandHandler;
  readonly createPWO: CreatePWOCommandHandler;
  readonly updatePWO: UpdatePWOCommandHandler;
  readonly deactivatePWO: DeactivatePWOCommandHandler;
  readonly createSWO: CreateSWOCommandHandler;
  readonly updateSWO: UpdateSWOCommandHandler;
  readonly deactivateSWO: DeactivateSWOCommandHandler;
  readonly createCI: CreateCapabilityInstanceCommandHandler;
  readonly deleteCI: DeleteCapabilityInstanceCommandHandler;
  readonly listSkills: ListSkillsQueryHandler;
  readonly createSkill: CreateSkillCommandHandler;
  readonly updateSkill: UpdateSkillCommandHandler;
  readonly deleteSkill: DeleteSkillCommandHandler;
  readonly listTasks: ListTasksQueryHandler;
  readonly createTask: CreateTaskCommandHandler;
  readonly updateTask: UpdateTaskCommandHandler;
  readonly deleteTask: DeleteTaskCommandHandler;
  readonly listControlPoints: ListControlPointsQueryHandler;
  readonly createControlPoint: CreateControlPointCommandHandler;
  readonly updateControlPoint: UpdateControlPointCommandHandler;
  readonly deleteControlPoint: DeleteControlPointCommandHandler;
}

export const registerWrcfCoreApiRuntime = async (app: FastifyInstanceLike): Promise<void> => {
  const fgRepo = new PrismaFunctionalGroupRepository();
  const pwoRepo = new PrismaPwoRepository();
  const swoRepo = new PrismaSwoRepository();
  const capRepo = new PrismaCapabilityRepository();
  const profRepo = new PrismaProficiencyRepository();
  const sectorRepo = new PrismaIndustrySectorRepository();
  const industryRepo = new PrismaIndustryRepository();
  const ciRepo = new PrismaCapabilityInstanceRepository();
  const skillRepo = new PrismaSkillRepository();
  const taskRepo = new PrismaTaskRepository();
  const cpRepo = new PrismaControlPointRepository();

  const deps: WrcfModuleDependencies = {
    listSectors: new ListSectorsQueryHandler(sectorRepo),
    listIndustries: new ListIndustriesQueryHandler(industryRepo),
    listFGs: new ListFGsQueryHandler(fgRepo),
    listPWOs: new ListPWOsQueryHandler(pwoRepo),
    listSWOs: new ListSWOsQueryHandler(swoRepo),
    listCapabilities: new ListCapabilitiesQueryHandler(capRepo),
    listProficiencies: new ListProficienciesQueryHandler(profRepo),
    listCIs: new ListCapabilityInstancesQueryHandler(ciRepo),
    createFG: new CreateFGCommandHandler(fgRepo),
    updateFG: new UpdateFGCommandHandler(fgRepo),
    deactivateFG: new DeactivateFGCommandHandler(fgRepo),
    createPWO: new CreatePWOCommandHandler(pwoRepo),
    updatePWO: new UpdatePWOCommandHandler(pwoRepo),
    deactivatePWO: new DeactivatePWOCommandHandler(pwoRepo),
    createSWO: new CreateSWOCommandHandler(swoRepo),
    updateSWO: new UpdateSWOCommandHandler(swoRepo),
    deactivateSWO: new DeactivateSWOCommandHandler(swoRepo),
    createCI: new CreateCapabilityInstanceCommandHandler(ciRepo),
    deleteCI: new DeleteCapabilityInstanceCommandHandler(ciRepo),
    listSkills: new ListSkillsQueryHandler(skillRepo),
    createSkill: new CreateSkillCommandHandler(skillRepo),
    updateSkill: new UpdateSkillCommandHandler(skillRepo),
    deleteSkill: new DeleteSkillCommandHandler(skillRepo),
    listTasks: new ListTasksQueryHandler(taskRepo),
    createTask: new CreateTaskCommandHandler(taskRepo),
    updateTask: new UpdateTaskCommandHandler(taskRepo),
    deleteTask: new DeleteTaskCommandHandler(taskRepo),
    listControlPoints: new ListControlPointsQueryHandler(cpRepo),
    createControlPoint: new CreateControlPointCommandHandler(cpRepo),
    updateControlPoint: new UpdateControlPointCommandHandler(cpRepo),
    deleteControlPoint: new DeleteControlPointCommandHandler(cpRepo)
  };

  await registerWrcfModule(app, deps);
};
