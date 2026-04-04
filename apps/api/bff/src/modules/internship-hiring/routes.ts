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

const getQueryString = (request: FastifyRequestLike): string => {
  const raw = (request as unknown as { url?: string }).url ?? '';
  const idx = raw.indexOf('?');
  return idx >= 0 ? raw.slice(idx) : '';
};

const forwardToCore = async (
  method: string,
  corePath: string,
  request: FastifyRequestLike,
  reply: FastifyReplyLike
): Promise<void> => {
  const params = (request.params as Record<string, string>) ?? {};
  let resolvedPath = corePath;
  for (const [key, val] of Object.entries(params)) {
    resolvedPath = resolvedPath.replace(`:${key}`, val);
  }

  const qs = method === 'GET' ? getQueryString(request) : '';
  const url = `${CORE_API_URL}${resolvedPath}${qs}`;
  const headers = buildCoreApiHeaders(request);

  const fetchOptions: RequestInit = { method, headers };
  if (method !== 'GET' && method !== 'DELETE') {
    headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(request.body ?? {});
  }

  const response = await fetch(url, fetchOptions);
  const text     = await response.text();
  const data     = text ? JSON.parse(text) : undefined;
  reply.status(response.status).send(data);
};

export const registerInternshipHiringBffRoutes = (app: FastifyInstanceLike): void => {
  app.route({ method: 'GET',  url: '/',                 handler: (req, rep) => forwardToCore('GET',  '/api/internships',                req, rep) });
  app.route({ method: 'POST', url: '/',                 handler: (req, rep) => forwardToCore('POST', '/api/internships',                req, rep) });
  app.route({ method: 'POST', url: '/files/upload',     handler: (req, rep) => forwardToCore('POST', '/api/internships/files/upload',   req, rep) });
  app.route({ method: 'GET',  url: '/:id',              handler: (req, rep) => forwardToCore('GET',  '/api/internships/:id',            req, rep) });
  app.route({ method: 'PUT',  url: '/:id',              handler: (req, rep) => forwardToCore('PUT',  '/api/internships/:id',            req, rep) });
  app.route({ method: 'POST', url: '/:id/publish',      handler: (req, rep) => forwardToCore('POST', '/api/internships/:id/publish',    req, rep) });
  app.route({ method: 'POST', url: '/:id/archive',      handler: (req, rep) => forwardToCore('POST', '/api/internships/:id/archive',    req, rep) });
};
