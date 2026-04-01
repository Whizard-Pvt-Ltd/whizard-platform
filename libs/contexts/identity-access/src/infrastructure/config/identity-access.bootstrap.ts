import { createAppLogger } from '@whizard/shared-logging';
import type { AuthorizationGateway } from '../../application/ports/gateways/authorization.gateway';
import type { IamCommandRepositories } from '../../application/ports/repositories/iam-command-repositories.port';
import type { IamTransactionContext } from '../../application/ports/transactions/iam-unit-of-work.port';
import type { IamUnitOfWorkPort } from '../../application/ports/transactions/iam-unit-of-work.port';
import { AuthenticateWithPasswordHandler } from '../../application/command-handlers/authenticate-with-password.handler';
import { RegisterLocalUserHandler } from '../../application/command-handlers/register-local-user.handler';
import { StartUserSessionHandler } from '../../application/command-handlers/start-user-session.handler';
import { PrismaOutboxPort } from '../messaging/kafka/outbox/prisma-outbox.port';
import { PrismaAccessPrincipalRepository } from '../persistence/postgres/repositories/prisma-access-principal.repository';
import { PrismaCredentialRepository } from '../persistence/postgres/repositories/prisma-credential.repository';
import { PrismaUserAccountRepository } from '../persistence/postgres/repositories/prisma-user-account.repository';
import { PrismaUserSessionRepository } from '../persistence/postgres/repositories/prisma-user-session.repository';
import { BcryptPasswordVerifierGateway } from '../security/bcrypt-password-verifier.gateway';
import { JwtTokenIssuerGateway } from '../security/jwt-token-issuer.gateway';

export const bootstrapIdentityAccess = (): {
  registerLocalUserHandler: RegisterLocalUserHandler;
  startUserSessionHandler: StartUserSessionHandler;
  authenticateWithPasswordHandler: AuthenticateWithPasswordHandler;
  accessPrincipalRepository: PrismaAccessPrincipalRepository;
} => {
  const userAccountRepository = new PrismaUserAccountRepository();
  const userSessionRepository = new PrismaUserSessionRepository();
  const credentialRepository = new PrismaCredentialRepository();
  const accessPrincipalRepository = new PrismaAccessPrincipalRepository();
  const outbox = new PrismaOutboxPort();
  const passwordVerifier = new BcryptPasswordVerifierGateway();
  const tokenIssuer = new JwtTokenIssuerGateway();
  const authLogger = createAppLogger({
    service: 'iam',
    component: 'authenticate-with-password'
  });

  const unitOfWork: IamUnitOfWorkPort = {
    execute: async <T>(work: (tx: IamTransactionContext) => Promise<T>): Promise<T> =>
      work({ transactionId: 'bootstrap-transaction' })
  };
  const authorizationGateway: AuthorizationGateway = {
    async assertCan(): Promise<void> {
      return;
    }
  };
  const repositories = {
    userAccounts: userAccountRepository,
    credentials: credentialRepository,
    sessions: userSessionRepository,
    accessPrincipals: accessPrincipalRepository,
    identityProviders: {
      async findById(): Promise<null> {
        return null;
      },
      async save(): Promise<void> {
        return;
      }
    },
    federatedAccounts: {
      async findById(): Promise<null> {
        return null;
      },
      async save(): Promise<void> {
        return;
      }
    },
    provisionedAccess: {
      async findById(): Promise<null> {
        return null;
      },
      async save(): Promise<void> {
        return;
      }
    },
    invitations: {
      async findById(): Promise<null> {
        return null;
      },
      async save(): Promise<void> {
        return;
      }
    }
  } satisfies IamCommandRepositories;

  const startUserSessionHandler = new StartUserSessionHandler(
    userAccountRepository,
    userSessionRepository,
    outbox
  );

  return {
    registerLocalUserHandler: new RegisterLocalUserHandler(
      unitOfWork,
      authorizationGateway,
      outbox,
      repositories
    ),
    startUserSessionHandler,
    authenticateWithPasswordHandler: new AuthenticateWithPasswordHandler(
      unitOfWork,
      authorizationGateway,
      outbox,
      repositories,
      passwordVerifier,
      tokenIssuer,
      startUserSessionHandler,
      authLogger
    ),
    accessPrincipalRepository
  };
};
