import type {
  ApiEnvelopeV1,
  AuthenticateWithPasswordRequestV1,
  AuthenticateWithPasswordResponseV1,
  RefreshSessionRequestV1,
  StartMfaChallengeRequestV1,
  VerifyMfaChallengeRequestV1
} from '@whizard/identity-access';
import { authorizationPreHandler } from '../shared/authorization-prehandler';
import { getRequestContext, toApiMeta, type FastifyInstanceLike } from '../shared/request-context';

interface IamAuthRouteDependencies {
  readonly authenticateWithPassword: {
    execute(input: {
      request: {
        actorUserAccountId: string;
        tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
        tenantId: string;
        payload: Record<string, unknown>;
      };
    }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly startMfaChallenge: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly verifyMfaChallenge: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly refreshSession: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly logoutSession: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
}

export const registerIamAuthRoutes = (
  app: FastifyInstanceLike,
  deps: IamAuthRouteDependencies
): void => {
  app.route({
    method: 'POST',
    url: '/login',
    config: {
      skipStackAuth: true
    },
    handler: async (request, reply) => {
      const body = (request.body ?? {}) as AuthenticateWithPasswordRequestV1;
      const context = getRequestContext(request);

      const result = await deps.authenticateWithPassword.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: body as unknown as Record<string, unknown>
        }
      });

      const response: ApiEnvelopeV1<AuthenticateWithPasswordResponseV1> = {
        success: true,
        data: {
          userAccountId: String(result.data?.userAccountId ?? ''),
          sessionId: String(result.data?.sessionId ?? ''),
          accessToken: String(result.data?.accessToken ?? ''),
          refreshToken: String(result.data?.refreshToken ?? ''),
          expiresAt: String(result.data?.expiresAt ?? new Date().toISOString()),
          authenticationMode: 'LOCAL_PASSWORD'
        },
        meta: toApiMeta(request)
      };

      reply.status(200).send(response);
    }
  });

  app.route({
    method: 'POST',
    url: '/mfa/challenges',
    preHandler: authorizationPreHandler('IAM.AUTHENTICATE'),
    handler: async (request, reply) => {
      const body = (request.body ?? {}) as StartMfaChallengeRequestV1;
      const context = getRequestContext(request);

      const result = await deps.startMfaChallenge.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: body as unknown as Record<string, unknown>
        }
      });

      reply.status(200).send({
        success: true,
        data: { challengeId: String(result.data?.challengeId ?? '') },
        meta: toApiMeta(request)
      });
    }
  });

  app.route({
    method: 'POST',
    url: '/mfa/challenges/verify',
    preHandler: authorizationPreHandler('IAM.AUTHENTICATE'),
    handler: async (request, reply) => {
      const body = (request.body ?? {}) as VerifyMfaChallengeRequestV1;
      const context = getRequestContext(request);

      const result = await deps.verifyMfaChallenge.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: body as unknown as Record<string, unknown>
        }
      });

      reply.status(200).send({
        success: true,
        data: { verified: Boolean(result.data?.verified ?? true) },
        meta: toApiMeta(request)
      });
    }
  });

  app.route({
    method: 'POST',
    url: '/refresh',
    preHandler: authorizationPreHandler('IAM.AUTHENTICATE'),
    handler: async (request, reply) => {
      const body = (request.body ?? {}) as RefreshSessionRequestV1;
      const context = getRequestContext(request);

      const result = await deps.refreshSession.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: body as unknown as Record<string, unknown>
        }
      });

      reply.status(200).send({
        success: true,
        data: result.data ?? {},
        meta: toApiMeta(request)
      });
    }
  });

  app.route({
    method: 'POST',
    url: '/logout',
    preHandler: authorizationPreHandler('IAM.AUTHENTICATE'),
    handler: async (request, reply) => {
      const context = getRequestContext(request);

      await deps.logoutSession.execute({
        request: {
          actorUserAccountId: context.actorUserAccountId,
          tenantType: context.tenantType,
          tenantId: context.tenantId,
          payload: (request.body ?? {}) as Record<string, unknown>
        }
      });

      reply.status(200).send({ success: true, data: { loggedOut: true }, meta: toApiMeta(request) });
    }
  });
};
