import { RegisterLocalUserHandler } from '../../application/command-handlers/register-local-user.handler';
import { StartUserSessionHandler } from '../../application/command-handlers/start-user-session.handler';
import type { IamCommandRepositories } from '../../application/ports/repositories/iam-command-repositories.port';
import type { IamTransactionContext } from '../../application/ports/transactions/iam-unit-of-work.port';
import type { IamUnitOfWorkPort } from '../../application/ports/transactions/iam-unit-of-work.port';
import type { AuthorizationGateway } from '../../application/ports/gateways/authorization.gateway';
import { PrismaOutboxPort } from '../messaging/kafka/outbox/prisma-outbox.port';
import { PrismaAccessPrincipalRepository } from '../persistence/postgres/repositories/prisma-access-principal.repository';
import { PrismaUserAccountRepository } from '../persistence/postgres/repositories/prisma-user-account.repository';
import { PrismaUserSessionRepository } from '../persistence/postgres/repositories/prisma-user-session.repository';

export const bootstrapIdentityAccess = (): {
  registerLocalUserHandler: RegisterLocalUserHandler;
  startUserSessionHandler: StartUserSessionHandler;
  accessPrincipalRepository: PrismaAccessPrincipalRepository;
} => {
  const userAccountRepository = new PrismaUserAccountRepository();
  const userSessionRepository = new PrismaUserSessionRepository();
  const accessPrincipalRepository = new PrismaAccessPrincipalRepository();
  const outbox = new PrismaOutboxPort();
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
    credentials: {
      async findActiveByUserAccountId(): Promise<null> {
        return null;
      }
    },
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

  return {
    registerLocalUserHandler: new RegisterLocalUserHandler(
      unitOfWork,
      authorizationGateway,
      outbox,
      repositories
    ),
    startUserSessionHandler: new StartUserSessionHandler(
      userAccountRepository,
      userSessionRepository,
      outbox
    ),
    accessPrincipalRepository
  };
};
