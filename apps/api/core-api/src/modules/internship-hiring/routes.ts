import { getPrisma } from '@whizard/shared-infrastructure';
import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { InternshipHiringModuleDependencies } from './runtime';
import { authorizationPreHandler } from '../iam/shared/authorization-prehandler';
import { getRequestContext, getLogContext, toApiMeta, type FastifyInstanceLike } from '../iam/shared/request-context';

const logger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'internship-hiring' });

const isDomainException = (err: unknown): err is Error =>
  err instanceof Error && err.name === 'DomainException';

const resolveCompanyTenantId = (
  ctx: ReturnType<typeof getRequestContext>,
  request: Parameters<typeof getRequestContext>[0],
): string | undefined =>
  ctx.tenantType === 'COMPANY'
    ? ctx.tenantId
    : ((request.headers['x-company-tenant-id'] as string | undefined) || undefined);

export const registerInternshipHiringRoutes = (
  app: FastifyInstanceLike,
  deps: InternshipHiringModuleDependencies
): void => {

  // GET /api/internships
  app.route({
    method: 'GET',
    url: '/',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const { search, status } = (request.query as Record<string, string | undefined>);
      const companyTenantId = resolveCompanyTenantId(ctx, request);
      logger.debug('Listing internships', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId, companyTenantId });
      const data = await deps.listInternships.execute({
        tenantId: ctx.tenantId,
        companyTenantId,
        search,
        status,
      });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    },
  });

  // POST /api/internships
  app.route({
    method: 'POST',
    url: '/',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx  = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      const companyTenantId = resolveCompanyTenantId(ctx, request);
      logger.debug('Creating internship', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId, companyTenantId });
      const data = await deps.createInternship.execute({
        ...(body as Record<string, unknown>),
        actorUserId:     ctx.actorUserAccountId,
        tenantId:        ctx.tenantId,
        companyTenantId: companyTenantId ?? null,
      } as never);
      reply.status(201).send({ success: true, data, meta: toApiMeta(request) });
    },
  });

  // GET /api/internships/coordinators?companyTenantId=xxx
  app.route({
    method: 'GET',
    url: '/coordinators',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const companyTenantId = resolveCompanyTenantId(ctx, request)
        ?? (request.query as Record<string, string>)['companyTenantId'];

      if (!companyTenantId) {
        return reply.status(400).send({ success: false, error: 'companyTenantId is required' });
      }

      const prisma = getPrisma();
      const memberships = await prisma.userAccountTenant.findMany({
        where: {
          tenantId: BigInt(companyTenantId),
          isActive: true,
        },
        select: {
          userAccount: {
            select: { publicUuid: true, primaryEmail: true },
          },
        },
      });

      const data = memberships.map(m => {
        const displayName = m.userAccount.primaryEmail.split('@')[0]
          .split(/[._-]/)
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        return { id: m.userAccount.publicUuid, email: m.userAccount.primaryEmail, name: displayName };
      });

      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    },
  });

  // GET /api/internships/roles — industry roles scoped to the company's tenant
  app.route({
    method: 'GET',
    url: '/roles',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const companyTenantId = resolveCompanyTenantId(ctx, request);

      if (!companyTenantId) {
        return reply
          .status(400)
          .send({ success: false, error: 'companyTenantId is required' });
      }

      const prisma = getPrisma();
      const company = await prisma.company.findFirst({
        where: { tenantId: BigInt(companyTenantId) },
        select: { industryId: true },
      });

      if (!company?.industryId) {
        return reply
          .status(200)
          .send({ success: true, data: [], meta: toApiMeta(request) });
      }

      const roles = await prisma.role.findMany({
        where: { industryId: company.industryId, tenantId: BigInt(companyTenantId), isActive: true },
        orderBy: { name: 'asc' },
        select: { publicUuid: true, name: true , id: true},
      });

      const data = roles.map((r: { publicUuid: string; name: string }) => ({
        id: r.publicUuid,
        name: r.name,
      }));
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    },
  });

  // GET /api/internships/functional-groups — functional groups filtered by role (via capability instances)
  app.route({
    method: 'GET',
    url: '/functional-groups',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const companyTenantId = resolveCompanyTenantId(ctx, request);
      const { roleId } = (request.query as Record<string, string | undefined>);

      if (!companyTenantId) {
        return reply.status(400).send({ success: false, error: 'companyTenantId is required' });
      }

      const prisma = getPrisma();

      // When roleId is provided, resolve FGs through Role → RoleCapabilityInstance → CapabilityInstance → FunctionalGroup
      if (roleId) {
        const role = await prisma.role.findFirst({
          where: { publicUuid: roleId, isActive: true },
          select: { id: true },
        });

        if (!role) {
          return reply.status(200).send({ success: true, data: [], meta: toApiMeta(request) });
        }

        const rcis = await prisma.roleCapabilityInstance.findMany({
          where: { roleId: role.id },
          select: {
            capabilityInstance: {
              select: {
                functionalGroup: {
                  select: { publicUuid: true, name: true, isActive: true },
                },
              },
            },
          },
        });

        // Deduplicate FGs and filter active ones
        const fgMap = new Map<string, { id: string; name: string }>();
        for (const rci of rcis) {
          const fg = rci.capabilityInstance.functionalGroup;
          if (fg.isActive && !fgMap.has(fg.publicUuid)) {
            fgMap.set(fg.publicUuid, { id: fg.publicUuid, name: fg.name });
          }
        }

        const data = [...fgMap.values()].sort((a, b) => a.name.localeCompare(b.name));
        return reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      }

      // Fallback: return all FGs for the company's industry/tenant
      const company = await prisma.company.findFirst({
        where: { tenantId: BigInt(companyTenantId) },
        select: { industryId: true },
      });

      if (!company?.industryId) {
        return reply.status(200).send({ success: true, data: [], meta: toApiMeta(request) });
      }

      const fgs = await prisma.functionalGroup.findMany({
        where: {
          industryId: company.industryId,
          tenantId: BigInt(companyTenantId),
          isActive: true,
        },
        orderBy: { name: 'asc' },
        select: { publicUuid: true, name: true },
      });

      const data = fgs.map(fg => ({ id: fg.publicUuid, name: fg.name }));
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    },
  });

  // GET /api/internships/pwos — list PWOs for a functional group + role
  app.route({
    method: 'GET',
    url: '/pwos',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const { functionalGroupId, roleId } = request.query as Record<string, string | undefined>;
      const companyTenantId = resolveCompanyTenantId(ctx, request);
      logger.debug('Listing PWOs for internship', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId });

      if (!companyTenantId || !functionalGroupId) {
        return reply.status(400).send({ success: false, error: 'companyTenantId and functionalGroupId are required' });
      }

      const prisma = getPrisma();
      const fg = await prisma.functionalGroup.findFirst({
        where: { publicUuid: functionalGroupId, isActive: true },
        select: { id: true },
      });
      if (!fg) {
        return reply.status(200).send({ success: true, data: [], meta: toApiMeta(request) });
      }

      let pwoIds: bigint[] | undefined;

      // If roleId provided, filter PWOs through Role → RoleCapabilityInstance → CapabilityInstance → PWO
      if (roleId) {
        const role = await prisma.role.findFirst({
          where: { publicUuid: roleId, isActive: true },
          select: { id: true },
        });
        if (role) {
          const rcis = await prisma.roleCapabilityInstance.findMany({
            where: { roleId: role.id },
            select: {
              capabilityInstance: {
                select: { pwoId: true },
              },
            },
          });
          pwoIds = [...new Set(rcis.map(r => r.capabilityInstance.pwoId).filter((id): id is bigint => id !== null))];
        }
      }

      const pwos = await prisma.primaryWorkObject.findMany({
        where: {
          functionalGroupId: fg.id,
          isActive: true,
          ...(pwoIds ? { id: { in: pwoIds } } : {}),
        },
        orderBy: { name: 'asc' },
        select: { publicUuid: true, name: true },
      });

      const data = pwos.map(p => ({ id: p.publicUuid, name: p.name }));
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    },
  });

  // GET /api/internships/capability-instances — list CIs for a PWO (name = SWO+Capability+Proficiency)
  app.route({
    method: 'GET',
    url: '/capability-instances',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const { pwoId } = request.query as Record<string, string | undefined>;
      logger.debug('Listing capability instances for PWO', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId });

      if (!pwoId) {
        return reply.status(400).send({ success: false, error: 'pwoId is required' });
      }

      const prisma = getPrisma();
      const pwo = await prisma.primaryWorkObject.findFirst({
        where: { publicUuid: pwoId, isActive: true },
        select: { id: true },
      });
      if (!pwo) {
        return reply.status(200).send({ success: true, data: [], meta: toApiMeta(request) });
      }

      const cis = await prisma.capabilityInstance.findMany({
        where: { pwoId: pwo.id, isActive: true },
        select: {
          publicUuid: true,
          swo: { select: { name: true } },
          capability: { select: { name: true } },
          proficiency: { select: { label: true } },
        },
      });

      const data = cis.map(ci => {
        const parts = [ci.swo?.name, ci.capability.name, ci.proficiency.label].filter(Boolean);
        return { id: ci.publicUuid, name: parts.join('+') };
      });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    },
  });

  // GET /api/internships/skills — list skills for a capability instance
  app.route({
    method: 'GET',
    url: '/skills',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const { capabilityInstanceId } = request.query as Record<string, string | undefined>;
      logger.debug('Listing skills for CI', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId });

      if (!capabilityInstanceId) {
        return reply.status(400).send({ success: false, error: 'capabilityInstanceId is required' });
      }

      const prisma = getPrisma();
      const ci = await prisma.capabilityInstance.findFirst({
        where: { publicUuid: capabilityInstanceId, isActive: true },
        select: { id: true },
      });
      if (!ci) {
        return reply.status(200).send({ success: true, data: [], meta: toApiMeta(request) });
      }

      const skills = await prisma.skill.findMany({
        where: { capabilityInstanceId: ci.id, isActive: true },
        orderBy: { name: 'asc' },
        select: { publicUuid: true, name: true },
      });

      const data = skills.map(s => ({ id: s.publicUuid, name: s.name }));
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    },
  });

  // GET /api/internships/tasks — list tasks + control_points for given skill IDs
  app.route({
    method: 'GET',
    url: '/tasks',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const { skillIds } = request.query as Record<string, string | undefined>;
      logger.debug('Listing tasks for skills', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId });

      if (!skillIds) {
        return reply.status(400).send({ success: false, error: 'skillIds is required' });
      }

      const prisma = getPrisma();
      const uuids = skillIds.split(',').map(s => s.trim()).filter(Boolean);
      const skills = await prisma.skill.findMany({
        where: { publicUuid: { in: uuids }, isActive: true },
        select: { id: true, publicUuid: true },
      });
      const skillIdMap = new Map(skills.map(s => [s.id, s.publicUuid]));

      const tasks = await prisma.task.findMany({
        where: { skillId: { in: skills.map(s => s.id) }, isActive: true },
        orderBy: { name: 'asc' },
        select: {
          publicUuid: true,
          name: true,
          description: true,
          skillId: true,
          controlPoints: {
            where: { isActive: true },
            select: { publicUuid: true, name: true, evidenceType: true },
          },
        },
      });

      const data = tasks.map(t => ({
        id: t.publicUuid,
        name: t.name,
        description: t.description,
        skillId: skillIdMap.get(t.skillId) ?? '',
        evidence: t.controlPoints.map(cp => cp.name).join(', '),
      }));
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    },
  });

  // GET /api/internships/:id/plans — get saved plans + schedules
  app.route({
    method: 'GET',
    url: '/:id/plans',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const { id } = request.params as { id: string };
      logger.debug('Getting internship plans', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId, internshipId: id });

      const prisma = getPrisma();
      const internship = await prisma.internship.findFirst({
        where: { publicUuid: id },
        select: { id: true },
      });
      if (!internship) {
        return reply.status(404).send({ success: false, error: 'Internship not found' });
      }

      const plans = await prisma.internshipPlan.findMany({
        where: { internshipId: internship.id },
        orderBy: { orderIndex: 'asc' },
        select: {
          publicUuid: true,
          orderIndex: true,
          noOfWeeks: true,
          mentorUserId: true,
          pwo: { select: { publicUuid: true, name: true } },
          capabilityInstance: {
            select: {
              publicUuid: true,
              swo: { select: { name: true } },
              capability: { select: { name: true } },
              proficiency: { select: { label: true } },
            },
          },
          schedules: {
            orderBy: { orderIndex: 'asc' as const },
            select: {
              publicUuid: true,
              weekNumber: true,
              orderIndex: true,
              evidence: true,
              task: {
                select: {
                  publicUuid: true,
                  name: true,
                  skillId: true,
                  skill: { select: { publicUuid: true, name: true } },
                },
              },
            },
          },
        },
      });

      // Resolve mentor names
      const mentorIds = [...new Set(plans.map(p => p.mentorUserId))];
      const mentorUsers = await prisma.userAccount.findMany({
        where: { id: { in: mentorIds } },
        select: { id: true, publicUuid: true, primaryEmail: true },
      });
      const mentorMap = new Map(mentorUsers.map(u => [u.id, { id: u.publicUuid, name: u.primaryEmail }]));

      const data = plans.map(p => {
        const ciParts = [p.capabilityInstance.swo?.name, p.capabilityInstance.capability.name, p.capabilityInstance.proficiency.label].filter(Boolean);
        const mentor = mentorMap.get(p.mentorUserId);
        return {
          id: p.publicUuid,
          orderIndex: p.orderIndex,
          noOfWeeks: p.noOfWeeks,
          pwoId: p.pwo.publicUuid,
          pwoName: p.pwo.name,
          capabilityInstanceId: p.capabilityInstance.publicUuid,
          capabilityInstanceName: ciParts.join('+'),
          mentorUserId: mentor?.id ?? '',
          mentorName: mentor?.name ?? '',
          schedules: p.schedules.map(s => ({
            id: s.publicUuid,
            taskId: s.task.publicUuid,
            taskName: s.task.name,
            skillId: s.task.skill.publicUuid,
            skillName: s.task.skill.name,
            weekNumber: s.weekNumber,
            orderIndex: s.orderIndex,
            evidence: s.evidence ?? '',
          })),
        };
      });

      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    },
  });

  // POST /api/internships/:id/plans — save/replace all plans + schedules
  app.route({
    method: 'POST',
    url: '/:id/plans',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const { id } = request.params as { id: string };
      const body = request.body as {
        plans: Array<{
          pwoId: string;
          capabilityInstanceId: string;
          mentorUserId: string;
          noOfWeeks: number;
          schedules?: Array<{ taskId: string; weekNumber: number; orderIndex: number; evidence: string }>;
        }>;
      };
      logger.debug('Saving internship plans', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId, internshipId: id });

      const prisma = getPrisma();
      const internship = await prisma.internship.findFirst({
        where: { publicUuid: id },
        select: { id: true },
      });
      if (!internship) {
        return reply.status(404).send({ success: false, error: 'Internship not found' });
      }

      // Resolve UUIDs to bigint IDs
      const pwoUuids = [...new Set(body.plans.map(p => p.pwoId))];
      const ciUuids = [...new Set(body.plans.map(p => p.capabilityInstanceId))];
      const mentorUuids = [...new Set(body.plans.map(p => p.mentorUserId))];
      const taskUuids = [...new Set(body.plans.flatMap(p => (p.schedules ?? []).map(s => s.taskId)))];

      const [pwos, cis, mentors, tasks] = await Promise.all([
        prisma.primaryWorkObject.findMany({ where: { publicUuid: { in: pwoUuids } }, select: { id: true, publicUuid: true } }),
        prisma.capabilityInstance.findMany({ where: { publicUuid: { in: ciUuids } }, select: { id: true, publicUuid: true } }),
        prisma.userAccount.findMany({ where: { publicUuid: { in: mentorUuids } }, select: { id: true, publicUuid: true } }),
        prisma.task.findMany({ where: { publicUuid: { in: taskUuids } }, select: { id: true, publicUuid: true } }),
      ]);

      const pwoMap = new Map(pwos.map(p => [p.publicUuid, p.id]));
      const ciMap = new Map(cis.map(c => [c.publicUuid, c.id]));
      const mentorMap = new Map(mentors.map(m => [m.publicUuid, m.id]));
      const taskMap = new Map(tasks.map(t => [t.publicUuid, t.id]));

      // Transaction: delete old plans (cascades schedules) then create new
      await prisma.$transaction(async (tx) => {
        await tx.internshipPlan.deleteMany({ where: { internshipId: internship.id } });

        for (let i = 0; i < body.plans.length; i++) {
          const p = body.plans[i];
          const pwoDbId = pwoMap.get(p.pwoId);
          const ciDbId = ciMap.get(p.capabilityInstanceId);
          const mentorDbId = mentorMap.get(p.mentorUserId);

          if (!pwoDbId || !ciDbId || !mentorDbId) continue;

          const plan = await tx.internshipPlan.create({
            data: {
              internshipId: internship.id,
              pwoId: pwoDbId,
              capabilityInstanceId: ciDbId,
              mentorUserId: mentorDbId,
              noOfWeeks: p.noOfWeeks,
              orderIndex: i,
            },
          });

          if (p.schedules?.length) {
            const scheduleData = p.schedules
              .map((s, idx) => {
                const taskDbId = taskMap.get(s.taskId);
                if (!taskDbId) return null;
                return {
                  internshipPlanId: plan.id,
                  taskId: taskDbId,
                  weekNumber: s.weekNumber ?? 1,
                  orderIndex: s.orderIndex ?? idx,
                  evidence: s.evidence || null,
                };
              })
              .filter((s): s is NonNullable<typeof s> => s !== null);

            if (scheduleData.length) {
              await tx.internshipSchedule.createMany({ data: scheduleData });
            }
          }
        }
      });

      reply.status(200).send({ success: true, data: { saved: true }, meta: toApiMeta(request) });
    },
  });

  // GET /api/internships/:id
  app.route({
    method: 'GET',
    url: '/:id',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const { id } = request.params as { id: string };
      logger.debug('Getting internship', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId, internshipId: id });
      try {
        const data = await deps.getInternshipById.execute({ id });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) return reply.status(404).send({ success: false, error: err.message });
        throw err;
      }
    },
  });

  // PUT /api/internships/:id
  app.route({
    method: 'PUT',
    url: '/:id',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx  = getRequestContext(request);
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, unknown>;
      logger.debug('Updating internship', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId, internshipId: id });
      try {
        const data = await deps.updateInternship.execute({
          ...(body as Record<string, unknown>),
          id,
          actorUserId: ctx.actorUserAccountId,
        } as never);
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) return reply.status(404).send({ success: false, error: err.message });
        throw err;
      }
    },
  });

  // POST /api/internships/:id/publish
  app.route({
    method: 'POST',
    url: '/:id/publish',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const { id } = request.params as { id: string };
      logger.debug('Publishing internship', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId, internshipId: id });
      try {
        const data = await deps.publishInternship.execute({ id, actorUserId: ctx.actorUserAccountId });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) return reply.status(404).send({ success: false, error: err.message });
        throw err;
      }
    },
  });

  // POST /api/internships/:id/archive
  app.route({
    method: 'POST',
    url: '/:id/archive',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const { id } = request.params as { id: string };
      logger.debug('Archiving internship', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId, internshipId: id });
      try {
        const data = await deps.archiveInternship.execute({ id, actorUserId: ctx.actorUserAccountId });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) return reply.status(404).send({ success: false, error: err.message });
        throw err;
      }
    },
  });
};
