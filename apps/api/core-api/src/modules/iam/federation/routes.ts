import { authorizationPreHandler } from '../shared/authorization-prehandler';
import { getRequestContext, toApiMeta, type FastifyInstanceLike } from '../shared/request-context';

interface IamFederationRouteDependencies {
  readonly createIdentityProvider: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly updateIdentityProvider: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly updateSsoRoleMapping: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
}

export const registerIamFederationRoutes = (
  app: FastifyInstanceLike,
  deps: IamFederationRouteDependencies
): void => {
  app.route({
    method: 'POST',
    url: '/identity-providers',
    preHandler: authorizationPreHandler('IAM.FEDERATION.ADMIN'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.createIdentityProvider.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: (request.body ?? {}) as Record<string, unknown>
        }
      });

      reply.status(201).send({ success: true, data: result.data ?? {}, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'PUT',
    url: '/identity-providers/:id',
    preHandler: authorizationPreHandler('IAM.FEDERATION.ADMIN'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.updateIdentityProvider.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: {
            id: (request.params as Record<string, string> | undefined)?.id,
            ...((request.body ?? {}) as Record<string, unknown>)
          }
        }
      });

      reply.status(200).send({ success: true, data: result.data ?? {}, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/sso-role-mappings',
    preHandler: authorizationPreHandler('IAM.FEDERATION.ADMIN'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.updateSsoRoleMapping.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: (request.body ?? {}) as Record<string, unknown>
        }
      });

      reply.status(200).send({ success: true, data: result.data ?? {}, meta: toApiMeta(request) });
    }
  });
};
