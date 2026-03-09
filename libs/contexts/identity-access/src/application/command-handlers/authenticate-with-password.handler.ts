/**
 * Authenticate With Password Command Handler
 *
 * This handler implements password-based user authentication within the identity-access domain.
 * It orchestrates the complete authentication workflow including:
 * - Authorization verification
 * - User account lookup and validation
 * - Credential verification
 * - Password validation
 * - Session creation
 * - Token issuance
 *
 * This is a core application service in the DDD (Domain-Driven Design) architecture,
 * coordinating between domain entities, repositories, and external gateways.
 */
import type { AuthenticateWithPasswordCommand } from '../commands/authenticate-with-password.command';
import type { AuthenticateWithPasswordResponseDto } from '../dto/responses/authenticate-with-password.response.dto';
import type { AppLogger } from '@whizard/shared-infrastructure';
import type { OutboxPort } from '../ports/event-bus/outbox.port';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { PasswordVerifierGateway } from '../ports/gateways/password-verifier.gateway';
import type { TokenIssuerGateway } from '../ports/gateways/token-issuer.gateway';
import type { IamUnitOfWorkPort } from '../ports/transactions/iam-unit-of-work.port';
import type { IamCommandRepositories } from '../ports/repositories/iam-command-repositories.port';
import type { StartUserSessionHandler } from './start-user-session.handler';

/**
 * No-op logger implementation used as default when no logger is provided.
 * Prevents errors when logger methods are called but no logger is injected.
 */
const NOOP_AUTH_TELEMETRY_LOGGER: Pick<AppLogger, 'info' | 'warn'> = {
  info: () => undefined,
  warn: () => undefined
};

/**
 * Masks sensitive parts of a login ID (email) for safe logging.
 *
 * This function protects user privacy by obscuring portions of the login ID
 * while keeping enough information for debugging purposes.
 *
 * @param loginId - The login ID (typically email address) to mask
 * @returns Masked login ID safe for logging
 *
 * @example
 * ```typescript
 * maskLoginId('user@example.com')  // Returns: 'us***@example.com'
 * maskLoginId('username')          // Returns: 'us***'
 * maskLoginId('')                  // Returns: '<empty>'
 * ```
 */
const maskLoginId = (loginId: string): string => {
  const trimmed = loginId.trim();
  if (trimmed.length === 0) {
    return '<empty>';
  }

  // Split by @ to handle email addresses differently
  const [localPart, domain] = trimmed.split('@');
  if (!domain) {
    // Not an email, just mask after first 2 chars
    return `${trimmed.slice(0, 2)}***`;
  }

  // For emails, show first 2 chars of local part and full domain
  const visibleLocal = localPart.slice(0, 2);
  return `${visibleLocal}***@${domain}`;
};

/**
 * Command handler for password-based authentication.
 *
 * This class orchestrates the authentication workflow by coordinating between:
 * - Authorization checks (ensuring the actor has permission to authenticate)
 * - User account lookup and validation
 * - Credential verification
 * - Password hashing verification
 * - Session creation
 * - Token issuance
 *
 * All database operations are executed within a unit of work transaction
 * to ensure data consistency.
 */
export class AuthenticateWithPasswordHandler {
  /**
   * Constructs the authentication handler with all required dependencies.
   *
   * @param unitOfWork - Transaction coordinator for database operations
   * @param authorizationGateway - Service for checking user permissions
   * @param outbox - Event bus for publishing domain events
   * @param repositories - Data access layer for IAM entities
   * @param passwordVerifier - Service for verifying password hashes
   * @param tokenIssuer - Service for issuing JWT tokens
   * @param startUserSessionHandler - Handler for creating user sessions
   * @param logger - Optional logger for authentication telemetry (defaults to no-op logger)
   */
  constructor(
    private readonly unitOfWork: IamUnitOfWorkPort,
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly outbox: OutboxPort,
    private readonly repositories: IamCommandRepositories,
    private readonly passwordVerifier: PasswordVerifierGateway,
    private readonly tokenIssuer: TokenIssuerGateway,
    private readonly startUserSessionHandler: StartUserSessionHandler,
    private readonly logger: Pick<AppLogger, 'info' | 'warn'> = NOOP_AUTH_TELEMETRY_LOGGER
  ) {}

  /**
   * Executes the password authentication workflow.
   *
   * Workflow Steps:
   * 1. Verify the actor has IAM.OPERATE permission
   * 2. Extract login credentials from the command payload
   * 3. Lookup user account by email (loginId)
   * 4. Validate account status is ACTIVE
   * 5. Retrieve active credentials for the user
   * 6. Verify password against stored hash
   * 7. Create a new user session
   * 8. Issue access and refresh tokens
   * 9. Return authentication response with tokens and session info
   *
   * @param command - Authentication command containing login credentials
   * @returns Authentication response with tokens and session information
   * @throws Error if credentials are invalid or account is not active
   *
   * @example
   * ```typescript
   * const response = await handler.execute({
   *   request: {
   *     actorUserAccountId: 'system',
   *     tenantType: 'PLATFORM',
   *     tenantId: 'whizard',
   *     payload: {
   *       loginId: 'user@example.com',
   *       password: 'securePassword123',
   *       clientContext: 'web'
   *     }
   *   }
   * });
   * console.log(response.data.accessToken); // JWT access token
   * ```
   */
  async execute(command: AuthenticateWithPasswordCommand): Promise<AuthenticateWithPasswordResponseDto> {
    const { actorUserAccountId, tenantType, tenantId, payload } = command.request;

    // Step 1: Verify authorization - ensure the actor has permission to authenticate
    this.logger.info('auth.authorization.check', {
      actorUserAccountId,
      tenantType,
      tenantId,
      permissionCode: 'IAM.OPERATE'
    });

    await this.authorizationGateway.assertCan({
      actorUserAccountId,
      tenantType,
      tenantId,
      permissionCode: 'IAM.OPERATE'
    });

    // Execute authentication workflow within a database transaction
    return this.unitOfWork.execute(async () => {
      // Step 2: Extract login credentials from payload
      const { loginId, password, clientContext } = payload as {
        loginId: string;
        password: string;
        clientContext: string;
      };

      // Log authentication attempt with masked login ID for privacy
      this.logger.info('auth.login.attempt', {
        actorUserAccountId,
        tenantType,
        tenantId,
        loginId: maskLoginId(loginId)
      });

      // Step 3: Lookup user account by email (loginId)
      this.logger.info('auth.user.lookup', {
        actorUserAccountId,
        loginId: maskLoginId(loginId)
      });

      const userAccount = await this.repositories.userAccounts.findByEmail(loginId);

      if (!userAccount) {
        // User not found - log failure without revealing whether user exists
        this.logger.warn('auth.login.failed', {
          actorUserAccountId,
          tenantType,
          tenantId,
          loginId: maskLoginId(loginId),
          reason: 'invalid_credentials'
        });
        throw new Error('Invalid credentials');
      }

      // Step 4: Validate account status
      if (userAccount.status !== 'ACTIVE') {
        this.logger.warn('auth.login.failed', {
          actorUserAccountId,
          tenantType,
          tenantId,
          userAccountId: userAccount.id.value,
          accountStatus: userAccount.status,
          reason: 'account_not_active'
        });
        throw new Error('Account is not active');
      }

      // Step 5: Retrieve active credentials for the user
      this.logger.info('auth.credentials.lookup', {
        actorUserAccountId,
        userAccountId: userAccount.id.value
      });

      const credential = await this.repositories.credentials.findActiveByUserAccountId(
        userAccount.id.value
      );

      if (!credential) {
        // No active credentials found
        this.logger.warn('auth.login.failed', {
          actorUserAccountId,
          tenantType,
          tenantId,
          userAccountId: userAccount.id.value,
          reason: 'invalid_credentials'
        });
        throw new Error('Invalid credentials');
      }

      // Step 6: Verify password against stored hash
      this.logger.info('auth.password.verify', {
        actorUserAccountId,
        userAccountId: userAccount.id.value
      });

      const isPasswordValid = await this.passwordVerifier.verify(
        password,
        credential.passwordHash
      );

      if (!isPasswordValid) {
        // Password verification failed
        this.logger.warn('auth.login.failed', {
          actorUserAccountId,
          tenantType,
          tenantId,
          userAccountId: userAccount.id.value,
          reason: 'invalid_credentials'
        });
        throw new Error('Invalid credentials');
      }

      // Step 7: Create a new user session
      this.logger.info('auth.session.create', {
        actorUserAccountId,
        userAccountId: userAccount.id.value,
        clientContext: clientContext || 'web'
      });

      const sessionResult = await this.startUserSessionHandler.execute({
        userAccountId: userAccount.id.value,
        clientContext: clientContext || 'web'
      });

      // Step 8: Issue access and refresh tokens
      this.logger.info('auth.tokens.issue', {
        actorUserAccountId,
        userAccountId: userAccount.id.value,
        sessionId: sessionResult.sessionId
      });

      const tokens = this.tokenIssuer.issue({
        userAccountId: userAccount.id.value,
        sessionId: sessionResult.sessionId,
        tenantType,
        tenantId
      });

      // Step 9: Log successful authentication and return response
      this.logger.info('auth.login.succeeded', {
        actorUserAccountId,
        tenantType,
        tenantId,
        userAccountId: userAccount.id.value,
        sessionId: sessionResult.sessionId
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
