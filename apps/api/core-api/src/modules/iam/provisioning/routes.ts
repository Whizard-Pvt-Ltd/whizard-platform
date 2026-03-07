import { authorizationPreHandler } from '../shared/authorization-prehandler';
import { getRequestContext, toApiMeta, type FastifyInstanceLike } from '../shared/request-context';

interface IamProvisioningRouteDependencies {
  readonly inviteUserToTenant: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly provisionAccessFromSso: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly suspendProvisionedAccess: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly reactivateProvisionedAccess: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly deprovisionAccess: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
}

export const registerIamProvisioningRoutes = (
  app: FastifyInstanceLike,
  deps: IamProvisioningRouteDependencies
): void => {
  app.route({
    method: 'POST',
    url: '/invitations',
    preHandler: authorizationPreHandler('IAM.PROVISIONING.ADMIN'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.inviteUserToTenant.execute({
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
    method: 'POST',
    url: '/from-sso',
    preHandler: authorizationPreHandler('IAM.PROVISIONING.ADMIN'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.provisionAccessFromSso.execute({
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
    url: '/suspend',
    preHandler: authorizationPreHandler('IAM.PROVISIONING.ADMIN'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.suspendProvisionedAccess.execute({
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
    url: '/reactivate',
    preHandler: authorizationPreHandler('IAM.PROVISIONING.ADMIN'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.reactivateProvisionedAccess.execute({
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
    url: '/deprovision',
    preHandler: authorizationPreHandler('IAM.PROVISIONING.ADMIN'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.deprovisionAccess.execute({
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
