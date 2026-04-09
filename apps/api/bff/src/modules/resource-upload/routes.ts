import type { FastifyInstanceLike, FastifyRequestLike, FastifyReplyLike } from '../iam/shared/request-context';

const CORE_API_URL = (process.env.CORE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

const buildCoreApiHeaders = (request: FastifyRequestLike): Record<string, string> => {
  const headers: Record<string, string> = {
    'X-Tenant-Type': String(request.headers['x-tenant-type'] ?? 'SYSTEM'),
    'X-Tenant-Id':   String(request.headers['x-tenant-id'] ?? process.env['SYSTEM_TENANT_ID'] ?? '1'),
  };
  if (request.headers['authorization']) {
    headers['Authorization'] = String(request.headers['authorization']);
  }
  return headers;
};

const forwardMultipart = async (
  corePath: string,
  request: FastifyRequestLike,
  reply: FastifyReplyLike,
): Promise<void> => {
  const url = `${CORE_API_URL}${corePath}`;
  const headers = buildCoreApiHeaders(request);
  const contentType = String(request.headers['content-type'] ?? '');
  headers['Content-Type'] = contentType;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: (request as unknown as { raw: NodeJS.ReadableStream }).raw as unknown as ReadableStream,
    duplex: 'half',
  } as RequestInit);

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;
  reply.status(response.status).send(data);
};

export const registerResourceUploadBffRoutes = (app: FastifyInstanceLike): void => {
  app.route({
    method: 'POST',
    url: '/upload',
    handler: (req, rep) => {
      const folder = (req.query as Record<string, string>)['folder'] || 'media';
      return forwardMultipart(`/api/resource-upload/upload?folder=${encodeURIComponent(folder)}`, req, rep);
    },
  });

  app.route({
    method: 'GET',
    url: '/signed-url',
    handler: async (req, rep) => {
      const key = (req.query as Record<string, string>)['key'] || '';
      const headers = buildCoreApiHeaders(req);
      const url = `${CORE_API_URL}/api/resource-upload/signed-url?key=${encodeURIComponent(key)}`;
      const response = await fetch(url, { headers });
      const text = await response.text();
      rep.status(response.status).send(text ? JSON.parse(text) : undefined);
    },
  });
};
