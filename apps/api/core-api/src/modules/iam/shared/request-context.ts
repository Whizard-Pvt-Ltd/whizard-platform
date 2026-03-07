import type { ApiMetaV1, TenantType } from '@whizard/identity-access';

export interface FastifyRequestLike {
  readonly headers: Record<string, string | string[] | undefined>;
  readonly params?: Record<string, string | undefined>;
  readonly query?: Record<string, string | undefined>;
  readonly body?: unknown;
}

export interface FastifyReplyLike {
  status(code: number): FastifyReplyLike;
  send(payload: unknown): void;
}

export type FastifyPreHandlerLike = (
  request: FastifyRequestLike,
  reply: FastifyReplyLike
) => Promise<void> | void;

export interface FastifyRouteLike {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly url: string;
  readonly preHandler?: FastifyPreHandlerLike | readonly FastifyPreHandlerLike[];
  readonly handler: (request: FastifyRequestLike, reply: FastifyReplyLike) => Promise<void> | void;
}

export interface FastifyInstanceLike {
  route(route: FastifyRouteLike): void;
  register(
    plugin: (app: FastifyInstanceLike) => Promise<void> | void,
    opts?: { prefix?: string }
  ): Promise<void> | void;
}

export interface IamRequestContext {
  readonly actorUserAccountId: string;
  readonly tenantType: TenantType;
  readonly tenantId: string;
  readonly permissions: readonly string[];
  readonly requestId?: string;
}

export const getRequestContext = (request: FastifyRequestLike): IamRequestContext => {
  const actorUserAccountId = String(request.headers['x-actor-user-account-id'] ?? 'anonymous');
  const tenantType = String(request.headers['x-tenant-type'] ?? 'SYSTEM') as TenantType;
  const tenantId = String(request.headers['x-tenant-id'] ?? 'system');
  const permissionsHeader = String(request.headers['x-permissions'] ?? '');

  return {
    actorUserAccountId,
    tenantType,
    tenantId,
    permissions: permissionsHeader
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
    requestId: request.headers['x-request-id']
      ? String(request.headers['x-request-id'])
      : undefined
  };
};

export const toApiMeta = (request: FastifyRequestLike): ApiMetaV1 => ({
  requestId: request.headers['x-request-id'] ? String(request.headers['x-request-id']) : undefined,
  timestamp: new Date().toISOString()
});
