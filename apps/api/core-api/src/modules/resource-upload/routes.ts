import { getOrCreateAppLogger } from '@whizard/shared-logging';
import { UploadError } from '@whizard/shared-resource-upload';
import type { FastifyInstanceLike } from '../iam/shared/request-context';
import type { ResourceUploadModuleDependencies } from './runtime';
import { getRequestContext, getLogContext, toApiMeta } from '../iam/shared/request-context';
import { authenticationPreHandler } from './auth-prehandler';

const logger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'resource-upload' });

export const registerResourceUploadRoutes = (
  app: FastifyInstanceLike,
  deps: ResourceUploadModuleDependencies,
): void => {

  // POST /api/resource-upload/upload
  app.route({
    method: 'POST',
    url: '/upload',
    preHandler: authenticationPreHandler,
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const fileData = await request.file?.();
      if (!fileData) return reply.status(400).send({ success: false, error: 'No file uploaded' });

      const buffer = await fileData.toBuffer();
      const folder = (request.query as Record<string, string>)['folder'] || 'media';
      logger.debug('Processing resource upload', {
        ...getLogContext(request),
        userId: ctx.actorUserAccountId,
        tenantId: ctx.tenantId,
        fileName: fileData.filename,
        mimeType: fileData.mimetype,
        sizeBytes: buffer.length,
        folder,
      });

      try {
        const result = await deps.uploadService.processAndUpload(
          { buffer, fileName: fileData.filename, mimeType: fileData.mimetype },
          { tenantId: ctx.tenantId, folder, generateThumbnails: true },
        );

        const saved = await deps.saveMediaAsset({
          tenantId: ctx.tenantId,
          name: fileData.filename,
          fileName: fileData.filename,
          url: result.url,
          key: result.key,
          type: result.resourceType,
          mimeType: result.mimeType,
          sizeBytes: result.sizeBytes,
          format: result.format,
          width: result.width,
          height: result.height,
          duration: result.duration,
          pages: result.pages,
          thumbnailUrl: result.thumbnailUrl,
          thumbnailKey: result.thumbnailKey,
          thumbnailXlUrl: result.thumbnailXlUrl,
          thumbnailXlKey: result.thumbnailXlKey,
          createdBy: ctx.actorUserAccountId,
        });

        reply.status(201).send({ success: true, data: saved, meta: toApiMeta(request) });
      } catch (err) {
        if (err instanceof UploadError) {
          reply.status(err.statusCode).send({ success: false, error: err.message, code: err.code });
        } else {
          throw err;
        }
      }
    },
  });

  // GET /api/resource-upload/signed-url?key=...
  app.route({
    method: 'GET',
    url: '/signed-url',
    preHandler: authenticationPreHandler,
    handler: async (request, reply) => {
      const key = (request.query as Record<string, string>)['key'];
      if (!key) return reply.status(400).send({ success: false, error: 'Missing "key" query parameter' });

      const signedUrl = await deps.getSignedUrl(key, 300);
      reply.status(200).send({ success: true, data: { url: signedUrl } });
    },
  });

  // POST /api/resource-upload/pdf-to-images
  app.route({
    method: 'POST',
    url: '/pdf-to-images',
    preHandler: authenticationPreHandler,
    handler: async (request, reply) => {
      const ctx = getRequestContext(request);
      const fileData = await request.file?.();
      if (!fileData) return reply.status(400).send({ success: false, error: 'No file uploaded' });

      const buffer = await fileData.toBuffer();
      logger.debug('Converting PDF to images', {
        ...getLogContext(request),
        userId: ctx.actorUserAccountId,
        tenantId: ctx.tenantId,
      });

      try {
        const pages = await deps.uploadService.convertPdfToImages(buffer, ctx.tenantId);
        reply.status(200).send({ success: true, data: { pages }, meta: toApiMeta(request) });
      } catch (err) {
        if (err instanceof UploadError) {
          reply.status(err.statusCode).send({ success: false, error: err.message, code: err.code });
        } else {
          throw err;
        }
      }
    },
  });
};
