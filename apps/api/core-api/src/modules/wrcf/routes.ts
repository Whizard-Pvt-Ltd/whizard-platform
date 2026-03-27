import { getRequestContext, getLogContext, toApiMeta, type FastifyInstanceLike } from '../iam/shared/request-context';
import { authorizationPreHandler } from '../iam/shared/authorization-prehandler';
import type { WrcfModuleDependencies } from './runtime';
import type { StrategicImportance, DomainType } from '@whizard/capability-framework';
import { resolveImpactLevel, CRITICALITY_LEVELS, COMPLEXITY_LEVELS, FREQUENCY_LEVELS } from '@whizard/capability-framework';
import { getOrCreateAppLogger } from '@whizard/shared-logging';

const logger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'wrcf' });

const isDomainException = (err: unknown): err is Error =>
  err instanceof Error && err.name === 'DomainException';

export const registerWrcfRoutes = (app: FastifyInstanceLike, deps: WrcfModuleDependencies): void => {

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
      const data = await deps.listFGs.execute(industryId, ctx.tenantId, ctx.actorUserAccountId);
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
    url: '/functional-groups/:fgId/pwos',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { fgId } = (request.params as { fgId: string });
      logger.debug('Listing PWOs', { ...getLogContext(request), fgId });
      const ctx = getRequestContext(request);
      const data = await deps.listPWOs.execute(fgId, ctx.tenantId, ctx.actorUserAccountId);
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
    url: '/pwos/:pwoId/swos',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { pwoId } = (request.params as { pwoId: string });
      logger.debug('Listing SWOs', { ...getLogContext(request), pwoId });
      const ctx = getRequestContext(request);
      const data = await deps.listSWOs.execute(pwoId, ctx.tenantId, ctx.actorUserAccountId);
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
      const data = await deps.listCIs.execute(ctx.tenantId, industryId, fgId);
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
      const ciId = query['ciId'] ?? '';
      logger.debug('Listing skills', { ...getLogContext(request), ciId });
      const data = await deps.listSkills.execute(ctx.tenantId, ciId);
      logger.debug('Listed skills', { ...getLogContext(request), ciId, count: data.length });
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
      logger.debug('Creating skill', { ...getLogContext(request), ciId: String(body['ciId']), name: String(body['name']) });
      await deps.createSkill.execute({
        tenantId: ctx.tenantId,
        ciId: String(body['ciId']),
        name: String(body['name']),
        description: body['description'] ? String(body['description']) : undefined,
        cognitiveType: String(body['cognitiveType']),
        skillCriticality: String(body['skillCriticality']),
        recertificationCycle: Number(body['recertificationCycle']),
        aiImpact: String(body['aiImpact'])
      });
      logger.info('Skill created', { ...getLogContext(request), ciId: String(body['ciId']) });
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
          description: body['description'] ? String(body['description']) : undefined,
          cognitiveType: body['cognitiveType'] ? String(body['cognitiveType']) : undefined,
          skillCriticality: body['skillCriticality'] ? String(body['skillCriticality']) : undefined,
          recertificationCycle: body['recertificationCycle'] !== undefined ? Number(body['recertificationCycle']) : undefined,
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
      const data = await deps.listTasks.execute(ctx.tenantId, skillId);
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
        standardDuration: body['standardDuration'] !== undefined ? Number(body['standardDuration']) : undefined,
        requiredProficiencyLevel: body['requiredProficiencyLevel'] !== undefined ? Number(body['requiredProficiencyLevel']) : undefined
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
          requiredProficiencyLevel: body['requiredProficiencyLevel'] !== undefined ? Number(body['requiredProficiencyLevel']) : undefined
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
      const data = await deps.listControlPoints.execute(ctx.tenantId, taskId);
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
        kpiThreshold: body['kpiThreshold'] ? String(body['kpiThreshold']) : undefined,
        escalationRequired: String(body['escalationRequired']),
        evidenceType: String(body['evidenceType'])
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
          kpiThreshold: body['kpiThreshold'] ? String(body['kpiThreshold']) : undefined,
          escalationRequired: body['escalationRequired'] ? String(body['escalationRequired']) : undefined,
          evidenceType: body['evidenceType'] ? String(body['evidenceType']) : undefined
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
      const industryId = query['industryId'] ?? '';
      logger.debug('Listing departments', { ...getLogContext(request), industryId });
      const data = await deps.listDepartments.execute(ctx.tenantId, industryId);
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
          fgIds: Array.isArray(body['fgIds']) ? (body['fgIds'] as string[]) : [],
          operationalCriticalityScore: body['operationalCriticalityScore'] !== undefined ? Number(body['operationalCriticalityScore']) : undefined,
          revenueContributionWeight: body['revenueContributionWeight'] !== undefined ? Number(body['revenueContributionWeight']) : undefined,
          regulatoryExposureLevel: body['regulatoryExposureLevel'] !== undefined ? Number(body['regulatoryExposureLevel']) : undefined,
          createdBy: ctx.actorUserAccountId
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
          fgIds: Array.isArray(body['fgIds']) ? (body['fgIds'] as string[]) : undefined,
          operationalCriticalityScore: body['operationalCriticalityScore'] !== undefined ? Number(body['operationalCriticalityScore']) : undefined,
          revenueContributionWeight: body['revenueContributionWeight'] !== undefined ? Number(body['revenueContributionWeight']) : undefined,
          regulatoryExposureLevel: body['regulatoryExposureLevel'] !== undefined ? Number(body['regulatoryExposureLevel']) : undefined,
          updatedBy: ctx.actorUserAccountId
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
    url: '/industry-roles',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const query = request.query as Record<string, string>;
      const departmentId = query['departmentId'] ?? '';
      logger.debug('Listing industry roles', { ...getLogContext(request), departmentId });
      const data = await deps.listIndustryRoles.execute(ctx.tenantId, departmentId);
      logger.debug('Listed industry roles', { ...getLogContext(request), departmentId, count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/industry-roles',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Creating industry role', { ...getLogContext(request), departmentId: String(body['departmentId']), name: String(body['name']) });
      try {
        const data = await deps.createIndustryRole.execute({
          tenantId: ctx.tenantId,
          departmentId: String(body['departmentId']),
          industryId: String(body['industryId']),
          name: String(body['name']),
          seniorityLevel: String(body['seniorityLevel']),
          reportingTo: body['reportingTo'] ? String(body['reportingTo']) : undefined,
          roleCriticalityScore: body['roleCriticalityScore'] !== undefined ? Number(body['roleCriticalityScore']) : undefined,
          createdBy: ctx.actorUserAccountId
        });
        logger.info('Industry role created', { ...getLogContext(request), roleId: data.id, name: data.name });
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
    url: '/industry-roles/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Updating industry role', { ...getLogContext(request), roleId: id });
      try {
        const data = await deps.updateIndustryRole.execute({
          id,
          tenantId: ctx.tenantId,
          name: body['name'] ? String(body['name']) : undefined,
          seniorityLevel: body['seniorityLevel'] ? String(body['seniorityLevel']) : undefined,
          reportingTo: body['reportingTo'] ? String(body['reportingTo']) : undefined,
          roleCriticalityScore: body['roleCriticalityScore'] !== undefined ? Number(body['roleCriticalityScore']) : undefined,
          updatedBy: ctx.actorUserAccountId
        });
        logger.info('Industry role updated', { ...getLogContext(request), roleId: id });
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
    url: '/industry-roles/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      const ctx = getRequestContext(request);
      logger.debug('Deleting industry role', { ...getLogContext(request), roleId: id });
      try {
        await deps.deleteIndustryRole.execute({ id, tenantId: ctx.tenantId });
        logger.info('Industry role deleted', { ...getLogContext(request), roleId: id });
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
    url: '/role-ci-mappings',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const query = request.query as Record<string, string>;
      const roleId = query['roleId'] ?? '';
      logger.debug('Listing role CI mappings', { ...getLogContext(request), roleId });
      const data = await deps.listRoleCIMappings.execute(roleId);
      logger.debug('Listed role CI mappings', { ...getLogContext(request), roleId, count: data.length });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/role-ci-mappings',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      const roleId = String(body['roleId']);
      logger.debug('Saving role CI mappings', { ...getLogContext(request), roleId });
      await deps.saveRoleCIMappings.execute({
        roleId,
        ciIds: Array.isArray(body['ciIds']) ? (body['ciIds'] as string[]) : [],
        createdBy: ctx.actorUserAccountId
      });
      logger.info('Role CI mappings saved', { ...getLogContext(request), roleId });
      reply.status(201).send({ success: true, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'DELETE',
    url: '/role-ci-mappings/:id',
    preHandler: authorizationPreHandler('WRCF.MANAGE'),
    handler: async (request, reply) => {
      const { id } = (request.params as { id: string });
      logger.debug('Deleting role CI mapping', { ...getLogContext(request), roleCiMappingId: id });
      await deps.deleteRoleCIMapping.execute({ id });
      logger.info('Role CI mapping deleted', { ...getLogContext(request), roleCiMappingId: id });
      reply.status(204).send(null);
    }
  });
};
