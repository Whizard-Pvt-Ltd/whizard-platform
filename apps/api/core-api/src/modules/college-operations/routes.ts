import type { CollegeMediaItem, CollegeContactItem } from '@whizard/college-operations';
import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { CollegeOperationsModuleDependencies } from './runtime';
import { authorizationPreHandler } from '../iam/shared/authorization-prehandler';
import { getRequestContext, getLogContext, toApiMeta, type FastifyInstanceLike } from '../iam/shared/request-context';

const logger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'college-operations' });

const isDomainException = (err: unknown): err is Error =>
  err instanceof Error && err.name === 'DomainException';

export const registerCollegeOperationsRoutes = (
  app: FastifyInstanceLike,
  deps: CollegeOperationsModuleDependencies
): void => {

  // GET /api/colleges
  app.route({
    method: 'GET',
    url: '/',
    preHandler: authorizationPreHandler('COLLEGE.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const query = request.query as Record<string, string>;
      logger.debug('Listing colleges', { ...getLogContext(request) });
      const data = await deps.listColleges.execute({
        tenantId: ctx.tenantId,
        search: query['search'],
        status: query['status'] !== undefined ? Number(query['status']) : undefined,
        page: query['page'] ? Number(query['page']) : 1,
        pageSize: query['pageSize'] ? Number(query['pageSize']) : 20,
      });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // POST /api/colleges
  app.route({
    method: 'POST',
    url: '/',
    preHandler: authorizationPreHandler('COLLEGE.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Creating college', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId });
      try {
        const data = await deps.createCollege.execute({
          actorUserId: ctx.actorUserAccountId,
          tenantId: ctx.tenantId,
          name: String(body['name']),
          affiliatedUniversity: String(body['affiliatedUniversity']),
          cityId: body['cityId'] ? String(body['cityId']) : null,
          cityCode: body['cityCode'] ? String(body['cityCode']) : null,
          collegeType: String(body['collegeType']),
          establishedYear: body['establishedYear'] ? Number(body['establishedYear']) : null,
          description: body['description'] ? String(body['description']) : null,
          degreesOffered: body['degreesOffered'] ? String(body['degreesOffered']) : null,
          placementHighlights: body['placementHighlights'] ? String(body['placementHighlights']) : null,
          inquiryEmail: body['inquiryEmail'] ? String(body['inquiryEmail']) : null,
          clubIds: Array.isArray(body['clubIds']) ? (body['clubIds'] as string[]) : [],
          programIds: Array.isArray(body['programIds']) ? (body['programIds'] as string[]) : [],
        });
        reply.status(201).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) return reply.status(422).send({ success: false, error: err.message });
        throw err;
      }
    }
  });

  // GET /api/colleges/clubs
  app.route({
    method: 'GET',
    url: '/clubs',
    preHandler: authorizationPreHandler('COLLEGE.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const data = await deps.listClubs.execute({ tenantId: ctx.tenantId });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // GET /api/colleges/degree-programs
  app.route({
    method: 'GET',
    url: '/degree-programs',
    preHandler: authorizationPreHandler('COLLEGE.MANAGE'),
    handler: async (request, reply) => {
      const data = await deps.listDegreePrograms.execute();
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // GET /api/colleges/media-assets
  app.route({
    method: 'GET',
    url: '/media-assets',
    preHandler: authorizationPreHandler('COLLEGE.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const query = request.query as Record<string, string>;
      const data = await deps.listMediaAssets.execute({ tenantId: ctx.tenantId, type: query['type'] });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // POST /api/colleges/media-assets/upload
  app.route({
    method: 'POST',
    url: '/media-assets/upload',
    preHandler: authorizationPreHandler('COLLEGE.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      const fileData = body['file'] as { filename: string; mimetype: string; data: string };
      const buffer = Buffer.from(fileData.data, 'base64');

      if (buffer.length > 2 * 1024 * 1024) {
        return reply.status(400).send({ success: false, error: 'File size exceeds 2MB limit' });
      }

      const data = await deps.uploadMediaAsset.execute({
        actorUserId: ctx.actorUserAccountId,
        tenantId: ctx.tenantId,
        fileName: fileData.filename,
        contentType: fileData.mimetype,
        buffer,
        assetType: (body['assetType'] as 'image' | 'video' | 'pdf') ?? 'image',
      });
      reply.status(201).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // GET /api/colleges/cities
  app.route({
    method: 'GET',
    url: '/cities',
    preHandler: authorizationPreHandler('COLLEGE.MANAGE'),
    handler: async (request, reply) => {
      const data = await deps.listCities.execute();
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // GET /api/colleges/users
  app.route({
    method: 'GET',
    url: '/users',
    preHandler: authorizationPreHandler('COLLEGE.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const data = await deps.listUsersForContacts.execute(ctx.tenantId);
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // GET /api/colleges/:id
  app.route({
    method: 'GET',
    url: '/:id',
    preHandler: authorizationPreHandler('COLLEGE.MANAGE'),
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      logger.debug('Getting college', { ...getLogContext(request), collegeId: id });
      try {
        const data = await deps.getCollegeById.execute({ collegeId: id });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) return reply.status(404).send({ success: false, error: err.message });
        throw err;
      }
    }
  });

  // PUT /api/colleges/:id
  app.route({
    method: 'PUT',
    url: '/:id',
    preHandler: authorizationPreHandler('COLLEGE.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, unknown>;
      logger.debug('Updating college', { ...getLogContext(request), collegeId: id, userId: ctx.actorUserAccountId, tenantId: ctx.tenantId });
      try {
        const data = await deps.updateCollege.execute({
          actorUserId: ctx.actorUserAccountId,
          tenantId: ctx.tenantId,
          collegeId: id,
          name: body['name'] ? String(body['name']) : undefined,
          affiliatedUniversity: body['affiliatedUniversity'] ? String(body['affiliatedUniversity']) : undefined,
          cityId: body['cityId'] !== undefined ? (body['cityId'] ? String(body['cityId']) : null) : undefined,
          collegeType: body['collegeType'] ? String(body['collegeType']) : undefined,
          establishedYear: body['establishedYear'] !== undefined ? (body['establishedYear'] ? Number(body['establishedYear']) : null) : undefined,
          description: body['description'] !== undefined ? (body['description'] ? String(body['description']) : null) : undefined,
          degreesOffered: body['degreesOffered'] !== undefined ? (body['degreesOffered'] ? String(body['degreesOffered']) : null) : undefined,
          placementHighlights: body['placementHighlights'] !== undefined ? (body['placementHighlights'] ? String(body['placementHighlights']) : null) : undefined,
          inquiryEmail: body['inquiryEmail'] !== undefined ? (body['inquiryEmail'] ? String(body['inquiryEmail']) : null) : undefined,
          clubIds: Array.isArray(body['clubIds']) ? (body['clubIds'] as string[]) : undefined,
          programIds: Array.isArray(body['programIds']) ? (body['programIds'] as string[]) : undefined,
          mediaItems: Array.isArray(body['mediaItems']) ? (body['mediaItems'] as CollegeMediaItem[]) : undefined,
          contacts: Array.isArray(body['contacts']) ? (body['contacts'] as CollegeContactItem[]) : undefined,
        });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) return reply.status(422).send({ success: false, error: err.message });
        throw err;
      }
    }
  });

  // POST /api/colleges/:id/publish
  app.route({
    method: 'POST',
    url: '/:id/publish',
    preHandler: authorizationPreHandler('COLLEGE.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const { id } = request.params as { id: string };
      logger.debug('Publishing college', { ...getLogContext(request), collegeId: id, userId: ctx.actorUserAccountId, tenantId: ctx.tenantId });
      try {
        const data = await deps.publishCollege.execute({
          actorUserId: ctx.actorUserAccountId,
          tenantId: ctx.tenantId,
          collegeId: id,
        });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) return reply.status(422).send({ success: false, error: err.message });
        throw err;
      }
    }
  });
};
