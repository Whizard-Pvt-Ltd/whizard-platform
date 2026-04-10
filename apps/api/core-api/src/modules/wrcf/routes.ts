import type { StrategicImportance, DomainType } from '@whizard/capability-framework';
import { resolveImpactLevel, CRITICALITY_LEVELS, COMPLEXITY_LEVELS, FREQUENCY_LEVELS } from '@whizard/capability-framework';
import { getPrisma } from '@whizard/shared-infrastructure';
import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { WrcfModuleDependencies } from './runtime';
import { authorizationPreHandler } from '../iam/shared/authorization-prehandler';
import { getRequestContext, getLogContext, toApiMeta, type FastifyInstanceLike } from '../iam/shared/request-context';

const logger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'wrcf' });

const isDomainException = (err: unknown): err is Error =>
  err instanceof Error && err.name === 'DomainException';

export const registerWrcfRoutes = (app: FastifyInstanceLike, deps: WrcfModuleDependencies): void => {

  app.route({
    method: 'GET',
    url: '/admin/tenants',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      if (ctx.tenantType !== 'SYSTEM') {
        reply.status(403).send({ success: false, error: { message: 'Forbidden' } });
        return;
      }
      const prisma = getPrisma();
      const rows = await prisma.tenant.findMany({
        where: { isActive: true, NOT: { type: 'SYSTEM' } },
        select: { id: true, name: true, type: true },
        orderBy: { name: 'asc' }
      });
      const data = rows.map(r => ({ id: r.id.toString(), name: r.name, type: r.type }));
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'GET',
    url: '/sectors',
    handler: async (request, reply) => {
      logger.debug('Listing sectors', { ...getLogContext(request) });
      const data = await deps.listSectors.execute();
      logger.debug('Listed sectors', { ...getLogContext(request), count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'GET',
    url: '/sectors/:sectorId/industries',
    handler: async (request, reply) => {
      const { sectorId } = (request.params as { sectorId: string });
      logger.debug('Listing industries', { ...getLogContext(request), sectorId });
      const data = await deps.listIndustries.execute(sectorId);
      logger.debug('Listed industries', { ...getLogContext(request), sectorId, count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'GET',
    url: '/industries/:industryId/dashboard-stats',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { industryId } = (request.params as { industryId: string });
      const ctx = getRequestContext(request);
      logger.debug('Getting dashboard stats', { ...getLogContext(request), industryId });
      const data = await deps.getDashboardStats.execute(ctx.tenantId, industryId, ctx.actorUserAccountId);
      logger.debug('Got dashboard stats', { ...getLogContext(request), industryId });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'GET',
    url: '/industries/:industryId/functional-groups',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { industryId } = (request.params as { industryId: string });
      logger.debug('Listing functional groups', { ...getLogContext(request), industryId });
      const ctx = getRequestContext(request);
      const data = await deps.listFGs.execute(industryId, ctx.tenantIds, ctx.ownedTenantIds, ctx.actorUserAccountId);
      logger.debug('Listed functional groups', { ...getLogContext(request), industryId, count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/functional-groups',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Creating functional group', {
        ...getLogContext(request),
        industryId: String(body['industryId']),
        name: String(body['name']),
        domainType: String(body['domainType'])
      });
      const data = await deps.createFG.execute({
        actorUserId: ctx.actorUserAccountId,
        tenantId: ctx.tenantId,
        industryId: String(body['industryId']),
        name: String(body['name']),
        description: body['description'] ? String(body['description']) : undefined,
        domainType: String(body['domainType']) as DomainType
      });
      logger.info('Functional group created', { ...getLogContext(request), fgId: data.id, name: data.name });
      reply.status(201).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'PATCH',
    url: '/functional-groups/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Updating functional group', { ...getLogContext(request), fgId: id });
      try {
        const data = await deps.updateFG.execute({
          actorUserId: ctx.actorUserAccountId,
          id,
          tenantId: ctx.tenantId,
          name: body['name'] ? String(body['name']) : undefined,
          description: body['description'] ? String(body['description']) : undefined,
          domainType: body['domainType'] ? String(body['domainType']) as DomainType : undefined
        });
        logger.info('Functional group updated', { ...getLogContext(request), fgId: id });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('Functional group not found', { ...getLogContext(request), fgId: id, error: (err as Error).message });
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'DELETE',
    url: '/functional-groups/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      logger.debug('Deactivating functional group', { ...getLogContext(request), fgId: id });
      try {
        await deps.deactivateFG.execute({ actorUserId: ctx.actorUserAccountId, id, tenantId: ctx.tenantId });
        logger.info('Functional group deleted', { ...getLogContext(request), fgId: id });
        reply.status(204).send(null);
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('Functional group delete blocked', { ...getLogContext(request), fgId: id, error: (err as Error).message });
          reply.status(409).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'GET',
    url: '/functional-groups/:id/can-delete',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      logger.debug('Checking FG deletable', { ...getLogContext(request), fgId: id });
      const data = await deps.checkFGDeletable.execute(id);
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'GET',
    url: '/functional-groups/:fgId/pwos',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { fgId } = (request.params as { fgId: string });
      logger.debug('Listing PWOs', { ...getLogContext(request), fgId });
      const ctx = getRequestContext(request);
      const data = await deps.listPWOs.execute(fgId, ctx.tenantIds, ctx.ownedTenantIds, ctx.actorUserAccountId);
      logger.debug('Listed PWOs', { ...getLogContext(request), fgId, count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/pwos',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Creating PWO', {
        ...getLogContext(request),
        functionalGroupId: String(body['functionalGroupId']),
        name: String(body['name'])
      });
      const data = await deps.createPWO.execute({
        actorUserId: ctx.actorUserAccountId,
        tenantId: ctx.tenantId,
        functionalGroupId: String(body['functionalGroupId']),
        name: String(body['name']),
        description: body['description'] ? String(body['description']) : undefined,
        strategicImportance: Number(body['strategicImportance']) as StrategicImportance,
        revenueImpact: resolveImpactLevel(String(body['revenueImpact']), CRITICALITY_LEVELS),
        downtimeSensitivity: resolveImpactLevel(String(body['downtimeSensitivity']), CRITICALITY_LEVELS)
      });
      logger.info('PWO created', { ...getLogContext(request), pwoId: data.id, name: data.name });
      reply.status(201).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'PATCH',
    url: '/pwos/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Updating PWO', { ...getLogContext(request), pwoId: id });
      try {
        const data = await deps.updatePWO.execute({
          actorUserId: ctx.actorUserAccountId,
          id,
          tenantId: ctx.tenantId,
          name: body['name'] ? String(body['name']) : undefined,
          description: body['description'] ? String(body['description']) : undefined,
          strategicImportance: body['strategicImportance'] ? Number(body['strategicImportance']) as StrategicImportance : undefined,
          revenueImpact: body['revenueImpact'] ? resolveImpactLevel(String(body['revenueImpact']), CRITICALITY_LEVELS) : undefined,
          downtimeSensitivity: body['downtimeSensitivity'] ? resolveImpactLevel(String(body['downtimeSensitivity']), CRITICALITY_LEVELS) : undefined
        });
        logger.info('PWO updated', { ...getLogContext(request), pwoId: id });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('PWO not found', { ...getLogContext(request), pwoId: id, error: (err as Error).message });
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'DELETE',
    url: '/pwos/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      logger.debug('Deactivating PWO', { ...getLogContext(request), pwoId: id });
      try {
        await deps.deactivatePWO.execute({ actorUserId: ctx.actorUserAccountId, id, tenantId: ctx.tenantId });
        logger.info('PWO deleted', { ...getLogContext(request), pwoId: id });
        reply.status(204).send(null);
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('PWO delete blocked', { ...getLogContext(request), pwoId: id, error: (err as Error).message });
          reply.status(409).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'GET',
    url: '/pwos/:id/can-delete',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      logger.debug('Checking PWO deletable', { ...getLogContext(request), pwoId: id });
      const data = await deps.checkPWODeletable.execute(id);
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'GET',
    url: '/pwos/:pwoId/swos',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { pwoId } = (request.params as { pwoId: string });
      logger.debug('Listing SWOs', { ...getLogContext(request), pwoId });
      const ctx = getRequestContext(request);
      const data = await deps.listSWOs.execute(pwoId, ctx.tenantIds, ctx.ownedTenantIds, ctx.actorUserAccountId);
      logger.debug('Listed SWOs', { ...getLogContext(request), pwoId, count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/swos',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Creating SWO', {
        ...getLogContext(request),
        pwoId: String(body['pwoId']),
        name: String(body['name'])
      });
      const data = await deps.createSWO.execute({
        actorUserId: ctx.actorUserAccountId,
        tenantId: ctx.tenantId,
        pwoId: String(body['pwoId']),
        name: String(body['name']),
        description: body['description'] ? String(body['description']) : undefined,
        operationalComplexity: resolveImpactLevel(String(body['operationalComplexity']), COMPLEXITY_LEVELS),
        assetCriticality: resolveImpactLevel(String(body['assetCriticality']), CRITICALITY_LEVELS),
        failureFrequency: resolveImpactLevel(String(body['failureFrequency']), FREQUENCY_LEVELS)
      });
      logger.info('SWO created', { ...getLogContext(request), swoId: data.id, name: data.name });
      reply.status(201).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'PATCH',
    url: '/swos/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Updating SWO', { ...getLogContext(request), swoId: id });
      try {
        const data = await deps.updateSWO.execute({
          actorUserId: ctx.actorUserAccountId,
          id,
          tenantId: ctx.tenantId,
          name: body['name'] ? String(body['name']) : undefined,
          description: body['description'] ? String(body['description']) : undefined,
          operationalComplexity: body['operationalComplexity'] ? resolveImpactLevel(String(body['operationalComplexity']), COMPLEXITY_LEVELS) : undefined,
          assetCriticality: body['assetCriticality'] ? resolveImpactLevel(String(body['assetCriticality']), CRITICALITY_LEVELS) : undefined,
          failureFrequency: body['failureFrequency'] ? resolveImpactLevel(String(body['failureFrequency']), FREQUENCY_LEVELS) : undefined
        });
        logger.info('SWO updated', { ...getLogContext(request), swoId: id });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('SWO not found', { ...getLogContext(request), swoId: id, error: (err as Error).message });
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'DELETE',
    url: '/swos/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      logger.debug('Deactivating SWO', { ...getLogContext(request), swoId: id });
      try {
        await deps.deactivateSWO.execute({ actorUserId: ctx.actorUserAccountId, id, tenantId: ctx.tenantId });
        logger.info('SWO deleted', { ...getLogContext(request), swoId: id });
        reply.status(204).send(null);
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('SWO delete blocked', { ...getLogContext(request), swoId: id, error: (err as Error).message });
          reply.status(409).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'GET',
    url: '/swos/:id/can-delete',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      logger.debug('Checking SWO deletable', { ...getLogContext(request), swoId: id });
      const data = await deps.checkSWODeletable.execute(id);
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'GET',
    url: '/capabilities',
    handler: async (request, reply) => {
      logger.debug('Listing capabilities', { ...getLogContext(request) });
      const data = await deps.listCapabilities.execute();
      logger.debug('Listed capabilities', { ...getLogContext(request), count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'GET',
    url: '/proficiencies',
    handler: async (request, reply) => {
      logger.debug('Listing proficiencies', { ...getLogContext(request) });
      const data = await deps.listProficiencies.execute();
      logger.debug('Listed proficiencies', { ...getLogContext(request), count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'GET',
    url: '/capability-instances',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const query = request.query as Record<string, string>;
      const industryId = query['industryId'];
      const fgId = query['fgId'];
      logger.debug('Listing capability instances', { ...getLogContext(request), industryId, fgId });
      const data = await deps.listCIs.execute(industryId, fgId, ctx.tenantIds, ctx.ownedTenantIds);
      logger.debug('Listed capability instances', { ...getLogContext(request), count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/capability-instances',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Creating capability instance', {
        ...getLogContext(request),
        functionalGroupId: String(body['functionalGroupId']),
        swoId: String(body['swoId']),
        capabilityId: String(body['capabilityId']),
        proficiencyId: String(body['proficiencyId'])
      });
      try {
        await deps.createCI.execute({
          tenantId: ctx.tenantId,
          functionalGroupId: String(body['functionalGroupId']),
          pwoId: String(body['pwoId']),
          swoId: String(body['swoId']),
          capabilityId: String(body['capabilityId']),
          proficiencyId: String(body['proficiencyId'])
        });
        logger.info('Capability instance created', { ...getLogContext(request) });
        reply.status(201).send({ success: true, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('Capability instance creation failed', { ...getLogContext(request), error: (err as Error).message });
          reply.status(409).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'DELETE',
    url: '/capability-instances/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      logger.debug('Deleting capability instance', { ...getLogContext(request), ciId: id });
      try {
        await deps.deleteCI.execute({ id, tenantId: ctx.tenantId });
        logger.info('Capability instance deleted', { ...getLogContext(request), ciId: id });
        reply.status(204).send(null);
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('Capability instance not found', { ...getLogContext(request), ciId: id, error: (err as Error).message });
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'GET',
    url: '/skills',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const query = request.query as Record<string, string>;
      const capabilityInstanceId = query['capabilityInstanceId'] ?? '';
      logger.debug('Listing skills', { ...getLogContext(request), capabilityInstanceId });
      const data = await deps.listSkills.execute(capabilityInstanceId, ctx.tenantIds, ctx.ownedTenantIds);
      logger.debug('Listed skills', { ...getLogContext(request), capabilityInstanceId, count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/skills',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Creating skill', { ...getLogContext(request), capabilityInstanceId: String(body['capabilityInstanceId']), name: String(body['name']) });
      await deps.createSkill.execute({
        tenantId: ctx.tenantId,
        capabilityInstanceId: String(body['capabilityInstanceId']),
        name: String(body['name']),
        cognitiveType: String(body['cognitiveType']),
        skillCriticality: String(body['skillCriticality']),
        recertificationCycleMonths: Number(body['recertificationCycleMonths']),
        aiImpact: String(body['aiImpact'])
      });
      logger.info('Skill created', { ...getLogContext(request), capabilityInstanceId: String(body['capabilityInstanceId']) });
      reply.status(201).send({ success: true, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'PATCH',
    url: '/skills/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Updating skill', { ...getLogContext(request), skillId: id });
      try {
        await deps.updateSkill.execute({
          id,
          tenantId: ctx.tenantId,
          name: body['name'] ? String(body['name']) : undefined,
          cognitiveType: body['cognitiveType'] ? String(body['cognitiveType']) : undefined,
          skillCriticality: body['skillCriticality'] ? String(body['skillCriticality']) : undefined,
          recertificationCycleMonths: body['recertificationCycleMonths'] !== undefined ? Number(body['recertificationCycleMonths']) : undefined,
          aiImpact: body['aiImpact'] ? String(body['aiImpact']) : undefined
        });
        logger.info('Skill updated', { ...getLogContext(request), skillId: id });
        reply.status(200).send({ success: true, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('Skill not found', { ...getLogContext(request), skillId: id, error: (err as Error).message });
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'DELETE',
    url: '/skills/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      logger.debug('Deleting skill', { ...getLogContext(request), skillId: id });
      try {
        await deps.deleteSkill.execute({ id, tenantId: ctx.tenantId });
        logger.info('Skill deleted', { ...getLogContext(request), skillId: id });
        reply.status(204).send(null);
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('Skill not found', { ...getLogContext(request), skillId: id, error: (err as Error).message });
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'GET',
    url: '/tasks',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const query = request.query as Record<string, string>;
      const skillId = query['skillId'] ?? '';
      logger.debug('Listing tasks', { ...getLogContext(request), skillId });
      const data = await deps.listTasks.execute(skillId, ctx.tenantIds, ctx.ownedTenantIds);
      logger.debug('Listed tasks', { ...getLogContext(request), skillId, count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/tasks',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Creating task', { ...getLogContext(request), skillId: String(body['skillId']), name: String(body['name']) });
      await deps.createTask.execute({
        tenantId: ctx.tenantId,
        skillId: String(body['skillId']),
        name: String(body['name']),
        description: body['description'] ? String(body['description']) : undefined,
        frequency: String(body['frequency']),
        complexity: String(body['complexity']),
        standardDuration: Number(body['standardDuration']),
        requiredProficiencyLevel: body['requiredProficiencyLevel'] ? String(body['requiredProficiencyLevel']) : undefined
      });
      logger.info('Task created', { ...getLogContext(request), skillId: String(body['skillId']) });
      reply.status(201).send({ success: true, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'PATCH',
    url: '/tasks/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Updating task', { ...getLogContext(request), taskId: id });
      try {
        await deps.updateTask.execute({
          id,
          tenantId: ctx.tenantId,
          name: body['name'] ? String(body['name']) : undefined,
          description: body['description'] ? String(body['description']) : undefined,
          frequency: body['frequency'] ? String(body['frequency']) : undefined,
          complexity: body['complexity'] ? String(body['complexity']) : undefined,
          standardDuration: body['standardDuration'] !== undefined ? Number(body['standardDuration']) : undefined,
          requiredProficiencyLevel: body['requiredProficiencyLevel'] ? String(body['requiredProficiencyLevel']) : undefined
        });
        logger.info('Task updated', { ...getLogContext(request), taskId: id });
        reply.status(200).send({ success: true, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('Task not found', { ...getLogContext(request), taskId: id, error: (err as Error).message });
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'DELETE',
    url: '/tasks/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      logger.debug('Deleting task', { ...getLogContext(request), taskId: id });
      try {
        await deps.deleteTask.execute({ id, tenantId: ctx.tenantId });
        logger.info('Task deleted', { ...getLogContext(request), taskId: id });
        reply.status(204).send(null);
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('Task not found', { ...getLogContext(request), taskId: id, error: (err as Error).message });
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'GET',
    url: '/control-points',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const query = request.query as Record<string, string>;
      const taskId = query['taskId'] ?? '';
      logger.debug('Listing control points', { ...getLogContext(request), taskId });
      const data = await deps.listControlPoints.execute(taskId, ctx.tenantIds, ctx.ownedTenantIds);
      logger.debug('Listed control points', { ...getLogContext(request), taskId, count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/control-points',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Creating control point', { ...getLogContext(request), taskId: String(body['taskId']), name: String(body['name']) });
      await deps.createControlPoint.execute({
        tenantId: ctx.tenantId,
        taskId: String(body['taskId']),
        name: String(body['name']),
        description: body['description'] ? String(body['description']) : undefined,
        riskLevel: String(body['riskLevel']),
        failureImpactType: String(body['failureImpactType']),
        kpiThreshold: body['kpiThreshold'] !== undefined ? Number(body['kpiThreshold']) : undefined,
        escalationRequired: Boolean(body['escalationRequired']),
        evidenceType: body['evidenceType'] ? String(body['evidenceType']) : undefined
      });
      logger.info('Control point created', { ...getLogContext(request), taskId: String(body['taskId']) });
      reply.status(201).send({ success: true, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'PATCH',
    url: '/control-points/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Updating control point', { ...getLogContext(request), controlPointId: id });
      try {
        await deps.updateControlPoint.execute({
          id,
          tenantId: ctx.tenantId,
          name: body['name'] ? String(body['name']) : undefined,
          description: body['description'] ? String(body['description']) : undefined,
          riskLevel: body['riskLevel'] ? String(body['riskLevel']) : undefined,
          failureImpactType: body['failureImpactType'] ? String(body['failureImpactType']) : undefined,
          kpiThreshold: body['kpiThreshold'] !== undefined ? Number(body['kpiThreshold']) : undefined,
          escalationRequired: body['escalationRequired'] !== undefined ? Boolean(body['escalationRequired']) : undefined
        });
        logger.info('Control point updated', { ...getLogContext(request), controlPointId: id });
        reply.status(200).send({ success: true, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('Control point not found', { ...getLogContext(request), controlPointId: id, error: (err as Error).message });
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'DELETE',
    url: '/control-points/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      logger.debug('Deleting control point', { ...getLogContext(request), controlPointId: id });
      try {
        await deps.deleteControlPoint.execute({ id, tenantId: ctx.tenantId });
        logger.info('Control point deleted', { ...getLogContext(request), controlPointId: id });
        reply.status(204).send(null);
      } catch (err) {
        if (isDomainException(err)) {
          logger.warn('Control point not found', { ...getLogContext(request), controlPointId: id, error: (err as Error).message });
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'GET',
    url: '/departments',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const query = request.query as Record<string, string>;
      const industryId = query['industryId'] || undefined;
      logger.debug('Listing departments', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantIds: ctx.tenantIds, industryId });
      const data = await deps.listDepartments.execute(ctx.tenantIds, ctx.ownedTenantIds, industryId);
      logger.debug('Listed departments', { ...getLogContext(request), industryId, count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/departments',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Creating department', { ...getLogContext(request), industryId: String(body['industryId']), name: String(body['name']) });
      try {
        const data = await deps.createDepartment.execute({
          tenantId: ctx.tenantId,
          industryId: String(body['industryId']),
          name: String(body['name']),
          functionalGroupIds: Array.isArray(body['functionalGroupIds']) ? (body['functionalGroupIds'] as string[]) : [],
          operationalCriticalityScore: body['operationalCriticalityScore'] !== undefined ? Number(body['operationalCriticalityScore']) : undefined,
          revenueContributionWeight: body['revenueContributionWeight'] !== undefined ? Number(body['revenueContributionWeight']) : undefined,
          regulatoryExposureLevel: body['regulatoryExposureLevel'] !== undefined ? Number(body['regulatoryExposureLevel']) : undefined,
        });
        logger.info('Department created', { ...getLogContext(request), departmentId: data.id, name: data.name });
        reply.status(201).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) {
          reply.status(409).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'PATCH',
    url: '/departments/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Updating department', { ...getLogContext(request), departmentId: id });
      try {
        const data = await deps.updateDepartment.execute({
          id,
          tenantId: ctx.tenantId,
          name: body['name'] ? String(body['name']) : undefined,
          functionalGroupIds: Array.isArray(body['functionalGroupIds']) ? (body['functionalGroupIds'] as string[]) : undefined,
          operationalCriticalityScore: body['operationalCriticalityScore'] !== undefined ? Number(body['operationalCriticalityScore']) : undefined,
          revenueContributionWeight: body['revenueContributionWeight'] !== undefined ? Number(body['revenueContributionWeight']) : undefined,
          regulatoryExposureLevel: body['regulatoryExposureLevel'] !== undefined ? Number(body['regulatoryExposureLevel']) : undefined,
        });
        logger.info('Department updated', { ...getLogContext(request), departmentId: id });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) {
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'DELETE',
    url: '/departments/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      logger.debug('Deleting department', { ...getLogContext(request), departmentId: id });
      try {
        await deps.deleteDepartment.execute({ id, tenantId: ctx.tenantId });
        logger.info('Department deleted', { ...getLogContext(request), departmentId: id });
        reply.status(204).send(null);
      } catch (err) {
        if (isDomainException(err)) {
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'GET',
    url: '/roles',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const query = request.query as Record<string, string>;
      const departmentId = query['departmentId'] ?? '';
      logger.debug('Listing roles', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantIds: ctx.tenantIds, departmentId });
      const data = await deps.listIndustryRoles.execute(departmentId, ctx.tenantIds, ctx.ownedTenantIds);
      logger.debug('Listed roles', { ...getLogContext(request), departmentId, count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/roles',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Creating role', { ...getLogContext(request), departmentId: String(body['departmentId']), name: String(body['name']) });
      try {
        const data = await deps.createIndustryRole.execute({
          tenantId: ctx.tenantId,
          departmentId: String(body['departmentId']),
          name: String(body['name']),
          description: body['description'] ? String(body['description']) : undefined,
          seniorityLevel: body['seniorityLevel'] ? String(body['seniorityLevel']) : undefined,
          reportingTo: body['reportingTo'] ? String(body['reportingTo']) : undefined,
          roleCriticalityScore: body['roleCriticalityScore'] ? Number(body['roleCriticalityScore']) : undefined,
          createdBy: ctx.actorUserAccountId
        });
        logger.info('Role created', { ...getLogContext(request), roleId: data.id, name: data.name });
        reply.status(201).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) {
          reply.status(409).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'PATCH',
    url: '/roles/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Updating role', { ...getLogContext(request), roleId: id });
      try {
        const data = await deps.updateIndustryRole.execute({
          id,
          tenantId: ctx.tenantId,
          name: body['name'] ? String(body['name']) : undefined,
          description: body['description'] ? String(body['description']) : undefined
        });
        logger.info('Role updated', { ...getLogContext(request), roleId: id });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) {
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'DELETE',
    url: '/roles/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      logger.debug('Deleting role', { ...getLogContext(request), roleId: id });
      try {
        await deps.deleteIndustryRole.execute({ id, tenantId: ctx.tenantId });
        logger.info('Role deleted', { ...getLogContext(request), roleId: id });
        reply.status(204).send(null);
      } catch (err) {
        if (isDomainException(err)) {
          reply.status(404).send({ success: false, error: { message: (err as Error).message }, meta: toApiMeta(request) });
        } else { throw err; }
      }
    }
  });

  app.route({
    method: 'GET',
    url: '/role-capability-instances',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const query = request.query as Record<string, string>;
      const roleId = query['roleId'] ?? '';
      logger.debug('Listing role capability instances', { ...getLogContext(request), roleId });
      const data = await deps.listRoleCIMappings.execute(roleId);
      logger.debug('Listed role capability instances', { ...getLogContext(request), roleId, count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/role-capability-instances',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      const roleId = String(body['roleId']);
      logger.debug('Saving role capability instances', { ...getLogContext(request), roleId });
      await deps.saveRoleCIMappings.execute({
        roleId,
        capabilityInstanceIds: Array.isArray(body['capabilityInstanceIds']) ? (body['capabilityInstanceIds'] as string[]) : []
      });
      logger.info('Role capability instances saved', { ...getLogContext(request), roleId });
      reply.status(201).send({ success: true, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'DELETE',
    url: '/role-capability-instances/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      logger.debug('Deleting role capability instance', { ...getLogContext(request), roleCapabilityInstanceId: id });
      await deps.deleteRoleCIMapping.execute({ id });
      logger.info('Role capability instance deleted', { ...getLogContext(request), roleCapabilityInstanceId: id });
      reply.status(204).send(null);
    }
  });
};
