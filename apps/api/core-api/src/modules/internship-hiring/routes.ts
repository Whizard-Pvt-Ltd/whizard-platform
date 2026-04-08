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
      const contacts = await prisma.companyContact.findMany({
        where: {
          company: { tenantId: BigInt(companyTenantId) },
          isActive: true,
        },
      });

      const userIds = contacts.map(c => c.userId);
      const users = await prisma.userAccount.findMany({
        where: { id: { in: userIds } },
        select: { id: true, publicUuid: true, primaryEmail: true },
      });
      const userMap = new Map(users.map(u => [u.id.toString(), u]));

      const data = contacts.flatMap(c => {
        const u = userMap.get(c.userId.toString());
        if (!u) return [];
        return [{ id: u.publicUuid, email: u.primaryEmail, name: u.primaryEmail, role: c.contactRole }];
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
        return reply.status(400).send({ success: false, error: 'companyTenantId is required' });
      }

      const prisma = getPrisma();
      const roles = await prisma.role.findMany({
        where: { tenantId: BigInt(companyTenantId), isActive: true },
        orderBy: { name: 'asc' },
        select: { publicUuid: true, name: true },
      });

      const data = roles.map((r: { publicUuid: string; name: string }) => ({ id: r.publicUuid, name: r.name }));
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    },
  });

  // GET /api/internships/functional-groups — functional groups for company's industry
  app.route({
    method: 'GET',
    url: '/functional-groups',
    preHandler: authorizationPreHandler('INTERNSHIP.MANAGE'),
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const companyTenantId = resolveCompanyTenantId(ctx, request);

      if (!companyTenantId) {
        return reply.status(400).send({ success: false, error: 'companyTenantId is required' });
      }

      const prisma = getPrisma();
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
