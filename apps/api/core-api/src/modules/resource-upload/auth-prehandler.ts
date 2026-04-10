import { getRequestContext, type FastifyPreHandlerLike } from '../iam/shared/request-context';

export const authenticationPreHandler: FastifyPreHandlerLike = async (request, reply) => {
  const context = getRequestContext(request);

  if (context.actorUserAccountId === 'anonymous') {
    reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHENTICATED', message: 'Missing actor identity.' },
      meta: { requestId: context.requestId, timestamp: new Date().toISOString() },
    });
  }
};
