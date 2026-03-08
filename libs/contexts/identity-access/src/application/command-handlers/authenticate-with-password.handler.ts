import type { AuthenticateWithPasswordCommand } from '../commands/authenticate-with-password.command';
import type { AuthenticateWithPasswordResponseDto } from '../dto/responses/authenticate-with-password.response.dto';
import type { OutboxPort } from '../ports/event-bus/outbox.port';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { PasswordVerifierGateway } from '../ports/gateways/password-verifier.gateway';
import type { TokenIssuerGateway } from '../ports/gateways/token-issuer.gateway';
import type { IamUnitOfWorkPort } from '../ports/transactions/iam-unit-of-work.port';
import type { IamCommandRepositories } from '../ports/repositories/iam-command-repositories.port';
import type { StartUserSessionHandler } from './start-user-session.handler';

export class AuthenticateWithPasswordHandler {
  constructor(
    private readonly unitOfWork: IamUnitOfWorkPort,
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly outbox: OutboxPort,
    private readonly repositories: IamCommandRepositories,
    private readonly passwordVerifier: PasswordVerifierGateway,
    private readonly tokenIssuer: TokenIssuerGateway,
    private readonly startUserSessionHandler: StartUserSessionHandler
  ) {}

  async execute(command: AuthenticateWithPasswordCommand): Promise<AuthenticateWithPasswordResponseDto> {
    const { actorUserAccountId, tenantType, tenantId, payload } = command.request;

    await this.authorizationGateway.assertCan({
      actorUserAccountId,
      tenantType,
      tenantId,
      permissionCode: 'IAM.OPERATE'
    });

    return this.unitOfWork.execute(async () => {
      // Extract login credentials from payload
      const { loginId, password, clientContext } = payload as {
        loginId: string;
        password: string;
        clientContext: string;
      };

      console.log('[AUTH] Login attempt for:', loginId);

      // Find user by email (loginId)
      const userAccount = await this.repositories.userAccounts.findByEmail(loginId);

      console.log('[AUTH] User found:', userAccount ? userAccount.id.value : 'NOT FOUND');

      if (!userAccount) {
        throw new Error('Invalid credentials');
      }

      // Check if account is active
      if (userAccount.status !== 'ACTIVE') {
        throw new Error('Account is not active');
      }

      // Find user credentials
      const credential = await this.repositories.credentials.findActiveByUserAccountId(
        userAccount.id.value
      );

      console.log('[AUTH] Credential found:', credential ? 'YES' : 'NO');
      console.log('[AUTH] Password hash format:', credential?.passwordHash.substring(0, 20) + '...');

      if (!credential) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      console.log('[AUTH] Verifying password...');
      const isPasswordValid = await this.passwordVerifier.verify(
        password,
        credential.passwordHash
      );

      console.log('[AUTH] Password valid:', isPasswordValid);

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Start user session
      const sessionResult = await this.startUserSessionHandler.execute({
        userAccountId: userAccount.id.value,
        clientContext: clientContext || 'web'
      });

      // Issue tokens
      const tokens = this.tokenIssuer.issue({
        userAccountId: userAccount.id.value,
        sessionId: sessionResult.sessionId,
        tenantType,
        tenantId
      });

      return {
        success: true,
        message: 'Authentication successful',
        data: {
          userAccountId: userAccount.id.value,
          sessionId: sessionResult.sessionId,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: sessionResult.expiresAt,
          authenticationMode: 'LOCAL_PASSWORD'
        }
      };
    });
  }
}
