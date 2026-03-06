import { RegisterLocalUserHandler } from '../../application/command-handlers/register-local-user.handler';
import { StartUserSessionHandler } from '../../application/command-handlers/start-user-session.handler';
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

  return {
    registerLocalUserHandler: new RegisterLocalUserHandler(userAccountRepository, outbox),
    startUserSessionHandler: new StartUserSessionHandler(
      userAccountRepository,
      userSessionRepository,
      outbox
    ),
    accessPrincipalRepository
  };
};
