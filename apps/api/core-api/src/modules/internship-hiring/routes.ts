import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { InternshipHiringModuleDependencies } from './runtime';
import { authorizationPreHandler } from '../iam/shared/authorization-prehandler';
import { getRequestContext, getLogContext, toApiMeta, type FastifyInstanceLike } from '../iam/shared/request-context';

const logger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'internship-hiring' });

const isDomainException = (err: unknown): err is Error =>
  err instanceof Error && err.name === 'DomainException';

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
      logger.debug('Listing internships', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId });
      const data = await deps.listInternships.execute({
        tenantId: ctx.tenantId,
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
      logger.debug('Creating internship', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId });
      const data = await deps.createInternship.execute({
        ...(body as Record<string, unknown>),
        actorUserId: ctx.actorUserAccountId,
        tenantId:    ctx.tenantId,
      } as never);
      reply.status(201).send({ success: true, data, meta: toApiMeta(request) });
    },
  });

  // POST /api/internships/files/upload
  app.route({
    method: 'POST',
    url: '/files/upload',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx      = getRequestContext(request);
      const fileData = await request.file?.();
      if (!fileData) return reply.status(400).send({ success: false, error: 'No file uploaded' });
      const buffer = await fileData.toBuffer();
      logger.debug('Uploading internship file', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId });
      const data = await deps.uploadInternshipFile.execute({
        actorUserId: ctx.actorUserAccountId,
        tenantId:    ctx.tenantId,
        fileName:    fileData.filename,
        mimeType:    fileData.mimetype,
        sizeBytes:   buffer.length,
        buffer,
      });
      reply.status(201).send({ success: true, data, meta: toApiMeta(request) });
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
