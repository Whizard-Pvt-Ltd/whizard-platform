import type { CompanyClubItem, CompanyContactItem, CompanyMediaItem } from '@whizard/company-organization';
import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { CompanyOrganizationModuleDependencies } from './runtime';
import { authorizationPreHandler } from '../iam/shared/authorization-prehandler';
import { getRequestContext, getLogContext, toApiMeta, type FastifyInstanceLike } from '../iam/shared/request-context';

const logger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'company-organization' });

const isDomainException = (err: unknown): err is Error =>
  err instanceof Error && err.name === 'DomainException';

export const registerCompanyOrganizationRoutes = (
  app: FastifyInstanceLike,
  deps: CompanyOrganizationModuleDependencies
): void => {

  // GET /api/companies/clubs
  app.route({
    method: 'GET',
    url: '/clubs',
    preHandler: authorizationPreHandler('COMPANY.MANAGE'),
    handler: async (request, reply) => {
      const data = await deps.listClubs.execute();
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // GET /api/companies/industries
  app.route({
    method: 'GET',
    url: '/industries',
    preHandler: authorizationPreHandler('COMPANY.MANAGE'),
    handler: async (request, reply) => {
      const data = await deps.listIndustries.execute();
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // GET /api/companies/users
  app.route({
    method: 'GET',
    url: '/users',
    preHandler: authorizationPreHandler('COMPANY.MANAGE'),
    handler: async (request, reply) => {
      const data = await deps.listUsersForContacts.execute();
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // GET /api/companies/cities
  app.route({
    method: 'GET',
    url: '/cities',
    preHandler: authorizationPreHandler('COMPANY.MANAGE'),
    handler: async (request, reply) => {
      const data = await deps.listCities.execute();
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // POST /api/companies/media-assets/upload
  app.route({
    method: 'POST',
    url: '/media-assets/upload',
    preHandler: authorizationPreHandler('COMPANY.MANAGE'),
    handler: async (request, reply) => {
      const ctx  = getRequestContext(request);
      const data_raw = await request.file?.();
      if (!data_raw) return reply.status(400).send({ success: false, error: 'No file uploaded' });
      const buffer = await data_raw.toBuffer();
      logger.debug('Uploading company media asset', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId });
      const data = await deps.uploadMediaAsset.execute({
        actorUserId: ctx.actorUserAccountId,
        tenantId: ctx.tenantId,
        fileName: data_raw.filename,
        mimeType: data_raw.mimetype,
        sizeBytes: buffer.length,
        buffer,
      });
      reply.status(201).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // GET /api/companies
  app.route({
    method: 'GET',
    url: '/',
    preHandler: authorizationPreHandler('COMPANY.MANAGE'),
    handler: async (request, reply) => {
      const query = request.query as Record<string, string>;
      logger.debug('Listing companies', { ...getLogContext(request) });
      const data = await deps.listCompanies.execute({ search: query['search'] });
      reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
    }
  });

  // POST /api/companies
  app.route({
    method: 'POST',
    url: '/',
    preHandler: authorizationPreHandler('COMPANY.MANAGE'),
    handler: async (request, reply) => {
      const ctx  = getRequestContext(request);
      const body = request.body as Record<string, unknown>;
      logger.debug('Creating company', { ...getLogContext(request), userId: ctx.actorUserAccountId, tenantId: ctx.tenantId });
      try {
        const data = await deps.createCompany.execute({
          actorUserId:          ctx.actorUserAccountId,
          name:                 String(body['name']),
          industryId:           body['industryId'] ? String(body['industryId']) : null,
          cityId:               body['cityId'] ? String(body['cityId']) : null,
          companyType:          body['companyType'] ? String(body['companyType']) : null,
          establishedYear:      body['establishedYear'] ? Number(body['establishedYear']) : null,
          description:          body['description'] ? String(body['description']) : null,
          whatWeOffer:          body['whatWeOffer'] ? String(body['whatWeOffer']) : null,
          awardsRecognition:    body['awardsRecognition'] ? String(body['awardsRecognition']) : null,
          keyProductsServices:  body['keyProductsServices'] ? String(body['keyProductsServices']) : null,
          recruitmentHighlights:body['recruitmentHighlights'] ? String(body['recruitmentHighlights']) : null,
          placementStats:       body['placementStats'] ? String(body['placementStats']) : null,
          inquiryEmail:         body['inquiryEmail'] ? String(body['inquiryEmail']) : null,
        });
        reply.status(201).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) return reply.status(422).send({ success: false, error: err.message });
        throw err;
      }
    }
  });

  // GET /api/companies/:id
  app.route({
    method: 'GET',
    url: '/:id',
    preHandler: authorizationPreHandler('COMPANY.MANAGE'),
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      logger.debug('Getting company by id', { ...getLogContext(request), companyId: id });
      try {
        const data = await deps.getCompanyById.execute({ companyId: id });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) return reply.status(404).send({ success: false, error: err.message });
        throw err;
      }
    }
  });

  // PUT /api/companies/:id
  app.route({
    method: 'PUT',
    url: '/:id',
    preHandler: authorizationPreHandler('COMPANY.MANAGE'),
    handler: async (request, reply) => {
      const ctx  = getRequestContext(request);
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, unknown>;
      logger.debug('Updating company', { ...getLogContext(request), userId: ctx.actorUserAccountId, companyId: id });
      try {
        const data = await deps.updateCompany.execute({
          actorUserId:          ctx.actorUserAccountId,
          companyId:            id,
          name:                 body['name'] ? String(body['name']) : undefined,
          industryId:           'industryId' in body ? (body['industryId'] ? String(body['industryId']) : null) : undefined,
          cityId:               'cityId' in body ? (body['cityId'] ? String(body['cityId']) : null) : undefined,
          companyType:          'companyType' in body ? (body['companyType'] ? String(body['companyType']) : null) : undefined,
          establishedYear:      'establishedYear' in body ? (body['establishedYear'] ? Number(body['establishedYear']) : null) : undefined,
          description:          'description' in body ? (body['description'] ? String(body['description']) : null) : undefined,
          whatWeOffer:          'whatWeOffer' in body ? (body['whatWeOffer'] ? String(body['whatWeOffer']) : null) : undefined,
          awardsRecognition:    'awardsRecognition' in body ? (body['awardsRecognition'] ? String(body['awardsRecognition']) : null) : undefined,
          keyProductsServices:  'keyProductsServices' in body ? (body['keyProductsServices'] ? String(body['keyProductsServices']) : null) : undefined,
          recruitmentHighlights:'recruitmentHighlights' in body ? (body['recruitmentHighlights'] ? String(body['recruitmentHighlights']) : null) : undefined,
          placementStats:       'placementStats' in body ? (body['placementStats'] ? String(body['placementStats']) : null) : undefined,
          inquiryEmail:         'inquiryEmail' in body ? (body['inquiryEmail'] ? String(body['inquiryEmail']) : null) : undefined,
          clubs:                Array.isArray(body['clubs']) ? (body['clubs'] as CompanyClubItem[]) : undefined,
          mediaItems:           Array.isArray(body['mediaItems']) ? (body['mediaItems'] as CompanyMediaItem[]) : undefined,
          contacts:             Array.isArray(body['contacts']) ? (body['contacts'] as CompanyContactItem[]) : undefined,
        });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) return reply.status(422).send({ success: false, error: err.message });
        throw err;
      }
    }
  });

  // POST /api/companies/:id/publish
  app.route({
    method: 'POST',
    url: '/:id/publish',
    preHandler: authorizationPreHandler('COMPANY.MANAGE'),
    handler: async (request, reply) => {
      const ctx  = getRequestContext(request);
      const { id } = request.params as { id: string };
      logger.debug('Publishing company', { ...getLogContext(request), userId: ctx.actorUserAccountId, companyId: id });
      try {
        const data = await deps.publishCompany.execute({ actorUserId: ctx.actorUserAccountId, companyId: id });
        reply.status(200).send({ success: true, data, meta: toApiMeta(request) });
      } catch (err) {
        if (isDomainException(err)) return reply.status(422).send({ success: false, error: err.message });
        throw err;
      }
    }
  });
};
