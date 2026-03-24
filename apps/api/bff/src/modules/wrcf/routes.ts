import type { FastifyInstanceLike, FastifyRequestLike, FastifyReplyLike } from '../iam/shared/request-context';

const CORE_API_URL = (process.env.CORE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

const buildCoreApiHeaders = (request: FastifyRequestLike): Record<string, string> => {
  const headers: Record<string, string> = {
    'X-Tenant-Type': String(request.headers['x-tenant-type'] ?? 'SYSTEM'),
    'X-Tenant-Id': String(request.headers['x-tenant-id'] ?? 'system')
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
  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  reply.status(response.status).send(data);
};

export const registerWrcfBffRoutes = (app: FastifyInstanceLike): void => {
  app.route({ method: 'GET', url: '/sectors', handler: (req, rep) => forwardToCore('GET', '/api/wrcf/sectors', req, rep) });
  app.route({ method: 'GET', url: '/sectors/:sectorId/industries', handler: (req, rep) => forwardToCore('GET', '/api/wrcf/sectors/:sectorId/industries', req, rep) });
  app.route({ method: 'GET', url: '/industries/:industryId/functional-groups', handler: (req, rep) => forwardToCore('GET', '/api/wrcf/industries/:industryId/functional-groups', req, rep) });
  app.route({ method: 'POST', url: '/functional-groups', handler: (req, rep) => forwardToCore('POST', '/api/wrcf/functional-groups', req, rep) });
  app.route({ method: 'PATCH', url: '/functional-groups/:id', handler: (req, rep) => forwardToCore('PATCH', '/api/wrcf/functional-groups/:id', req, rep) });
  app.route({ method: 'DELETE', url: '/functional-groups/:id', handler: (req, rep) => forwardToCore('DELETE', '/api/wrcf/functional-groups/:id', req, rep) });
  app.route({ method: 'GET', url: '/functional-groups/:fgId/pwos', handler: (req, rep) => forwardToCore('GET', '/api/wrcf/functional-groups/:fgId/pwos', req, rep) });
  app.route({ method: 'POST', url: '/pwos', handler: (req, rep) => forwardToCore('POST', '/api/wrcf/pwos', req, rep) });
  app.route({ method: 'PATCH', url: '/pwos/:id', handler: (req, rep) => forwardToCore('PATCH', '/api/wrcf/pwos/:id', req, rep) });
  app.route({ method: 'DELETE', url: '/pwos/:id', handler: (req, rep) => forwardToCore('DELETE', '/api/wrcf/pwos/:id', req, rep) });
  app.route({ method: 'GET', url: '/pwos/:pwoId/swos', handler: (req, rep) => forwardToCore('GET', '/api/wrcf/pwos/:pwoId/swos', req, rep) });
  app.route({ method: 'POST', url: '/swos', handler: (req, rep) => forwardToCore('POST', '/api/wrcf/swos', req, rep) });
  app.route({ method: 'PATCH', url: '/swos/:id', handler: (req, rep) => forwardToCore('PATCH', '/api/wrcf/swos/:id', req, rep) });
  app.route({ method: 'DELETE', url: '/swos/:id', handler: (req, rep) => forwardToCore('DELETE', '/api/wrcf/swos/:id', req, rep) });
  app.route({ method: 'GET', url: '/capabilities', handler: (req, rep) => forwardToCore('GET', '/api/wrcf/capabilities', req, rep) });
  app.route({ method: 'GET', url: '/proficiencies', handler: (req, rep) => forwardToCore('GET', '/api/wrcf/proficiencies', req, rep) });
  app.route({ method: 'GET', url: '/capability-instances', handler: (req, rep) => forwardToCore('GET', '/api/wrcf/capability-instances', req, rep) });
  app.route({ method: 'POST', url: '/capability-instances', handler: (req, rep) => forwardToCore('POST', '/api/wrcf/capability-instances', req, rep) });
  app.route({ method: 'DELETE', url: '/capability-instances/:id', handler: (req, rep) => forwardToCore('DELETE', '/api/wrcf/capability-instances/:id', req, rep) });
  app.route({ method: 'GET', url: '/skills', handler: (req, rep) => forwardToCore('GET', '/api/wrcf/skills', req, rep) });
  app.route({ method: 'POST', url: '/skills', handler: (req, rep) => forwardToCore('POST', '/api/wrcf/skills', req, rep) });
  app.route({ method: 'PATCH', url: '/skills/:id', handler: (req, rep) => forwardToCore('PATCH', '/api/wrcf/skills/:id', req, rep) });
  app.route({ method: 'DELETE', url: '/skills/:id', handler: (req, rep) => forwardToCore('DELETE', '/api/wrcf/skills/:id', req, rep) });
  app.route({ method: 'GET', url: '/tasks', handler: (req, rep) => forwardToCore('GET', '/api/wrcf/tasks', req, rep) });
  app.route({ method: 'POST', url: '/tasks', handler: (req, rep) => forwardToCore('POST', '/api/wrcf/tasks', req, rep) });
  app.route({ method: 'PATCH', url: '/tasks/:id', handler: (req, rep) => forwardToCore('PATCH', '/api/wrcf/tasks/:id', req, rep) });
  app.route({ method: 'DELETE', url: '/tasks/:id', handler: (req, rep) => forwardToCore('DELETE', '/api/wrcf/tasks/:id', req, rep) });
  app.route({ method: 'GET', url: '/control-points', handler: (req, rep) => forwardToCore('GET', '/api/wrcf/control-points', req, rep) });
  app.route({ method: 'POST', url: '/control-points', handler: (req, rep) => forwardToCore('POST', '/api/wrcf/control-points', req, rep) });
  app.route({ method: 'PATCH', url: '/control-points/:id', handler: (req, rep) => forwardToCore('PATCH', '/api/wrcf/control-points/:id', req, rep) });
  app.route({ method: 'DELETE', url: '/control-points/:id', handler: (req, rep) => forwardToCore('DELETE', '/api/wrcf/control-points/:id', req, rep) });
};
