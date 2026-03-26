import type { ApiMetaV1 } from '@whizard/identity-access';

type TenantType = 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';

export interface FastifyRequestLike {
  readonly headers: Record<string, string | string[] | undefined>;
  readonly params?: unknown;
  readonly query?: unknown;
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
  readonly method: string;
  readonly url: string;
  readonly config?: {
    skipStackAuth?: boolean;
  };
  readonly preHandler?: FastifyPreHandlerLike | FastifyPreHandlerLike[];
  readonly handler: (request: FastifyRequestLike, reply: FastifyReplyLike) => Promise<void> | void;
}

export interface FastifyInstanceLike {
  route(route: FastifyRouteLike): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register(plugin: (instance: any, opts?: any) => void | Promise<void>, opts?: any): any;
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

export const getLogContext = (request: FastifyRequestLike) => ({
  userId: request.headers['x-actor-user-account-id']
    ? String(request.headers['x-actor-user-account-id'])
    : undefined,
  username: request.headers['x-actor-email']
    ? String(request.headers['x-actor-email'])
    : undefined,
  tenantId: request.headers['x-tenant-id']
    ? String(request.headers['x-tenant-id'])
    : undefined,
  requestId: request.headers['x-request-id']
    ? String(request.headers['x-request-id'])
    : undefined
});

export const toApiMeta = (request: FastifyRequestLike): ApiMetaV1 => ({
  requestId: request.headers['x-request-id'] ? String(request.headers['x-request-id']) : undefined,
  timestamp: new Date().toISOString()
});
