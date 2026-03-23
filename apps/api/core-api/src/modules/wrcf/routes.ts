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
};
