import { getRequestContext, type FastifyPreHandlerLike } from './request-context';

export const authorizationPreHandler = (requiredPermission: string): FastifyPreHandlerLike => {
  return async (request, reply) => {
    const context = getRequestContext(request);

    if (context.actorUserAccountId === 'anonymous') {
      reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Missing actor identity.' },
        meta: { requestId: context.requestId, timestamp: new Date().toISOString() }
      });
      return;
    }

    const allowed =
      context.permissions.includes(requiredPermission) || context.permissions.includes('IAM.ADMIN');

    if (!allowed) {
      reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: `Missing permission: ${requiredPermission}` },
        meta: { requestId: context.requestId, timestamp: new Date().toISOString() }
      });
    }
  };
};
