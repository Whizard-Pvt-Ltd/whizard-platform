/**
 * Stack Auth Login Use Case
 *
 * Authenticates users via Stack Auth and syncs them to local database.
 *
 * Flow:
 * 1. Accept email/password from client (via BFF)
 * 2. Call Stack Auth API to authenticate
 * 3. Receive JWT tokens from Stack Auth
 * 4. Verify token using JWKS
 * 5. Sync user to local database
 * 6. Return tokens to client
 */

import type { StackAuthTokenVerifierGateway, StackAuthUserSyncService } from '@whizard/identity-access';
import { loadStackAuthConfig } from '@whizard/identity-access';
import { getOrCreateAppLogger } from '@whizard/shared-logging';

const logger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'stack-auth-login' });

interface StackAuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email?: string;
}

export interface StackAuthLoginUseCaseDeps {
  readonly tokenVerifier: StackAuthTokenVerifierGateway;
  readonly userSyncService: StackAuthUserSyncService;
}

export class StackAuthLoginUseCase {
  private readonly stackAuthConfig = loadStackAuthConfig();

  constructor(private readonly deps: StackAuthLoginUseCaseDeps) {}

  async execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> {
    const { request } = input;
    const payload = request.payload as Record<string, unknown>;

    const email = String(payload.email ?? '');
    const password = String(payload.password ?? '');

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      logger.info('Stack Auth login attempt', { email });

      // Step 1: Authenticate with Stack Auth REST API
      const stackAuthResponse = await this.authenticateWithStackAuth(email, password);

      if (!stackAuthResponse.access_token || !stackAuthResponse.refresh_token) {
        throw new Error('Stack Auth did not return tokens');
      }

      logger.info('Stack Auth authentication successful', {
        userId: stackAuthResponse.user_id,
        email
      });

      // Step 2: Verify the token
      const stackAuthUser = await this.deps.tokenVerifier.verifyToken(stackAuthResponse.access_token);

      logger.info('Stack Auth token verified', {
        userId: stackAuthUser.userId,
        email: stackAuthUser.email,
        emailVerified: stackAuthUser.emailVerified
      });

      // Step 3: Sync user to local database
      const localUser = await this.deps.userSyncService.syncUser(stackAuthUser);

      logger.info('User synced to local database', {
        userId: localUser.id.value,
        stackAuthUserId: stackAuthUser.userId,
        email: localUser.email.value
      });

      // Step 4: Return response
      return {
        data: {
          userAccountId: localUser.id.value,
          sessionId: stackAuthUser.userId, // Use Stack Auth user ID as session ID
          accessToken: stackAuthResponse.access_token,
          refreshToken: stackAuthResponse.refresh_token,
          expiresAt: this.calculateExpiresAt(stackAuthResponse.access_token)
        }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      logger.error('Stack Auth login failed', {
        email,
        error: errorMessage
      });

      throw new Error(errorMessage);
    }
  }

  private async authenticateWithStackAuth(email: string, password: string): Promise<StackAuthResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-stack-project-id': this.stackAuthConfig.projectId,
      'x-stack-access-type': 'client'
    };

    if (this.stackAuthConfig.publishableClientKey) {
      headers['x-stack-publishable-client-key'] = this.stackAuthConfig.publishableClientKey;
    }

    const response = await fetch('https://api.stack-auth.com/api/v1/auth/password/sign-in', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Authentication failed' }));
      throw new Error(errorData.error || `Stack Auth error: ${response.status}`);
    }

    return response.json();
  }

  private calculateExpiresAt(accessToken: string): string {
    try {
      const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
      if (payload.exp) {
        return new Date(payload.exp * 1000).toISOString();
      }
    } catch (error) {
      logger.error('Failed to decode JWT', { error });
    }

    // Fallback: 30 minutes
    return new Date(Date.now() + 30 * 60 * 1000).toISOString();
  }
}
