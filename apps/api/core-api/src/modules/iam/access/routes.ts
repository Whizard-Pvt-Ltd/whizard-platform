import { authorizationPreHandler } from '../shared/authorization-prehandler';
import { getRequestContext, toApiMeta, type FastifyInstanceLike } from '../shared/request-context';

interface IamAccessAdminRouteDependencies {
  readonly assignRole: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly revokeRole: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly grantPermission: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly revokePermission: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
}

export const registerIamAccessAdminRoutes = (
  app: FastifyInstanceLike,
  deps: IamAccessAdminRouteDependencies
): void => {
  app.route({
    method: 'POST',
    url: '/roles/assign',
    preHandler: authorizationPreHandler('IAM.ACCESS.ADMIN'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.assignRole.execute({
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

  app.route({
    method: 'POST',
    url: '/roles/revoke',
    preHandler: authorizationPreHandler('IAM.ACCESS.ADMIN'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.revokeRole.execute({
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

  app.route({
    method: 'POST',
    url: '/permissions/grant',
    preHandler: authorizationPreHandler('IAM.ACCESS.ADMIN'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.grantPermission.execute({
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

  app.route({
    method: 'POST',
    url: '/permissions/revoke',
    preHandler: authorizationPreHandler('IAM.ACCESS.ADMIN'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.revokePermission.execute({
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
