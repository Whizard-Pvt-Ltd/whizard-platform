import type {
  ApiEnvelopeV1,
  EvaluateAccessDecisionResponseV1,
  SessionViewV1,
  UserProfileResponseV1
} from '@whizard/identity-access';
import { authorizationPreHandler } from '../shared/authorization-prehandler';
import { getRequestContext, toApiMeta, type FastifyInstanceLike } from '../shared/request-context';

interface IamUserAccessRouteDependencies {
  readonly getCurrentUserProfile: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly getMyAccessGrants: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly getTenantMemberships: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly getMySessions: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly revokeAllSessions: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
}

export const registerIamUserAccessRoutes = (
  app: FastifyInstanceLike,
  deps: IamUserAccessRouteDependencies
): void => {
  app.route({
    method: 'GET',
    url: '/me',
    preHandler: authorizationPreHandler('IAM.READ'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.getCurrentUserProfile.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: {}
        }
      });

      const response: ApiEnvelopeV1<UserProfileResponseV1> = {
        success: true,
        data: {
          userAccountId: String(result.data?.userAccountId ?? context.actorUserAccountId),
          email: String(result.data?.email ?? ''),
          status: 'ACTIVE',
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          mfaRequired: Boolean(result.data?.mfaRequired ?? false)
        },
        meta: toApiMeta(request)
      };

      reply.status(200).send(response);
    }
  });

  app.route({
    method: 'GET',
    url: '/me/access-grants',
    preHandler: authorizationPreHandler('IAM.READ'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.getMyAccessGrants.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: {}
        }
      });

      const response: ApiEnvelopeV1<EvaluateAccessDecisionResponseV1> = {
        success: true,
        data: {
          effect: (result.data?.effect as 'ALLOW' | 'DENY') ?? 'DENY',
          reason: String(result.data?.reason ?? 'No grants resolved')
        },
        meta: toApiMeta(request)
      };

      reply.status(200).send(response);
    }
  });

  app.route({
    method: 'GET',
    url: '/me/memberships',
    preHandler: authorizationPreHandler('IAM.READ'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.getTenantMemberships.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: {}
        }
      });

      reply.status(200).send({ success: true, data: result.data ?? {}, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'GET',
    url: '/me/sessions',
    preHandler: authorizationPreHandler('IAM.READ'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      const result = await deps.getMySessions.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: {}
        }
      });

      const sessions = (result.data?.sessions as SessionViewV1[] | undefined) ?? [];
      reply.status(200).send({ success: true, data: sessions, meta: toApiMeta(request) });
    }
  });

  app.route({
    method: 'POST',
    url: '/me/sessions/revoke-all',
    preHandler: authorizationPreHandler('IAM.OPERATE'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);
      await deps.revokeAllSessions.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: {}
        }
      });

      reply.status(200).send({ success: true, data: { revoked: true }, meta: toApiMeta(request) });
    }
  });
};
