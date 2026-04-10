import {
  PrismaWrcfDashboardRepository,
  GetDashboardStatsQueryHandler,
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
  PrismaDepartmentRepository,
  PrismaIndustryRoleRepository,
  PrismaRoleCIMappingRepository,
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
  ListDepartmentsQueryHandler,
  ListIndustryRolesQueryHandler,
  ListRoleCIMappingsQueryHandler,
  CreateFGCommandHandler,
  UpdateFGCommandHandler,
  DeactivateFGCommandHandler,
  CheckFGDeletableQueryHandler,
  CreatePWOCommandHandler,
  UpdatePWOCommandHandler,
  DeactivatePWOCommandHandler,
  CheckPWODeletableQueryHandler,
  CreateSWOCommandHandler,
  UpdateSWOCommandHandler,
  DeactivateSWOCommandHandler,
  CheckSWODeletableQueryHandler,
  CreateCapabilityInstanceCommandHandler,
  DeleteCapabilityInstanceCommandHandler,
  CreateSkillCommandHandler,
  UpdateSkillCommandHandler,
  DeleteSkillCommandHandler,
  CreateTaskCommandHandler,
  UpdateTaskCommandHandler,
  DeleteTaskCommandHandler,
  CheckTaskDeletableQueryHandler,
  CreateControlPointCommandHandler,
  UpdateControlPointCommandHandler,
  DeleteControlPointCommandHandler,
  CreateDepartmentCommandHandler,
  UpdateDepartmentCommandHandler,
  DeleteDepartmentCommandHandler,
  CreateIndustryRoleCommandHandler,
  UpdateIndustryRoleCommandHandler,
  DeleteIndustryRoleCommandHandler,
  SaveRoleCIMappingsCommandHandler,
  DeleteRoleCIMappingCommandHandler
} from '@whizard/capability-framework';
import type { FastifyInstanceLike } from '../iam/shared/request-context';
import { registerWrcfModule } from './wrcf.module';

export interface WrcfModuleDependencies {
  readonly getDashboardStats: GetDashboardStatsQueryHandler;
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
  readonly checkFGDeletable: CheckFGDeletableQueryHandler;
  readonly createPWO: CreatePWOCommandHandler;
  readonly updatePWO: UpdatePWOCommandHandler;
  readonly deactivatePWO: DeactivatePWOCommandHandler;
  readonly checkPWODeletable: CheckPWODeletableQueryHandler;
  readonly createSWO: CreateSWOCommandHandler;
  readonly updateSWO: UpdateSWOCommandHandler;
  readonly deactivateSWO: DeactivateSWOCommandHandler;
  readonly checkSWODeletable: CheckSWODeletableQueryHandler;
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
  readonly checkTaskDeletable: CheckTaskDeletableQueryHandler;
  readonly listControlPoints: ListControlPointsQueryHandler;
  readonly createControlPoint: CreateControlPointCommandHandler;
  readonly updateControlPoint: UpdateControlPointCommandHandler;
  readonly deleteControlPoint: DeleteControlPointCommandHandler;
  readonly listDepartments: ListDepartmentsQueryHandler;
  readonly createDepartment: CreateDepartmentCommandHandler;
  readonly updateDepartment: UpdateDepartmentCommandHandler;
  readonly deleteDepartment: DeleteDepartmentCommandHandler;
  readonly listIndustryRoles: ListIndustryRolesQueryHandler;
  readonly createIndustryRole: CreateIndustryRoleCommandHandler;
  readonly updateIndustryRole: UpdateIndustryRoleCommandHandler;
  readonly deleteIndustryRole: DeleteIndustryRoleCommandHandler;
  readonly listRoleCIMappings: ListRoleCIMappingsQueryHandler;
  readonly saveRoleCIMappings: SaveRoleCIMappingsCommandHandler;
  readonly deleteRoleCIMapping: DeleteRoleCIMappingCommandHandler;
}

export const registerWrcfCoreApiRuntime = async (app: FastifyInstanceLike): Promise<void> => {
  const dashboardRepo = new PrismaWrcfDashboardRepository();
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
  const deptRepo = new PrismaDepartmentRepository();
  const roleRepo = new PrismaIndustryRoleRepository();
  const roleCiRepo = new PrismaRoleCIMappingRepository();

  const deps: WrcfModuleDependencies = {
    getDashboardStats: new GetDashboardStatsQueryHandler(dashboardRepo),
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
    checkFGDeletable: new CheckFGDeletableQueryHandler(fgRepo),
    createPWO: new CreatePWOCommandHandler(pwoRepo),
    updatePWO: new UpdatePWOCommandHandler(pwoRepo),
    deactivatePWO: new DeactivatePWOCommandHandler(pwoRepo),
    checkPWODeletable: new CheckPWODeletableQueryHandler(pwoRepo),
    createSWO: new CreateSWOCommandHandler(swoRepo),
    updateSWO: new UpdateSWOCommandHandler(swoRepo),
    deactivateSWO: new DeactivateSWOCommandHandler(swoRepo),
    checkSWODeletable: new CheckSWODeletableQueryHandler(swoRepo),
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
    checkTaskDeletable: new CheckTaskDeletableQueryHandler(taskRepo),
    listControlPoints: new ListControlPointsQueryHandler(cpRepo),
    createControlPoint: new CreateControlPointCommandHandler(cpRepo),
    updateControlPoint: new UpdateControlPointCommandHandler(cpRepo),
    deleteControlPoint: new DeleteControlPointCommandHandler(cpRepo),
    listDepartments: new ListDepartmentsQueryHandler(deptRepo),
    createDepartment: new CreateDepartmentCommandHandler(deptRepo),
    updateDepartment: new UpdateDepartmentCommandHandler(deptRepo),
    deleteDepartment: new DeleteDepartmentCommandHandler(deptRepo),
    listIndustryRoles: new ListIndustryRolesQueryHandler(roleRepo),
    createIndustryRole: new CreateIndustryRoleCommandHandler(roleRepo, deptRepo),
    updateIndustryRole: new UpdateIndustryRoleCommandHandler(roleRepo),
    deleteIndustryRole: new DeleteIndustryRoleCommandHandler(roleRepo),
    listRoleCIMappings: new ListRoleCIMappingsQueryHandler(roleCiRepo),
    saveRoleCIMappings: new SaveRoleCIMappingsCommandHandler(roleCiRepo),
    deleteRoleCIMapping: new DeleteRoleCIMappingCommandHandler(roleCiRepo)
  };

  await registerWrcfModule(app, deps);
};
