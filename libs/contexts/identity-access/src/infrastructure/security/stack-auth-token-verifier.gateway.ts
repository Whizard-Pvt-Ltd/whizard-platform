/**
 * Stack Auth Token Verifier Gateway
 *
 * Verifies JWT tokens issued by Stack Auth using JWKS (JSON Web Key Set).
 * Stack Auth uses ES256 algorithm for signing tokens.
 *
 * Architecture:
 * - Angular -> Stack Auth API (login/signup) -> JWT tokens
 * - Angular -> BFF -> Core-API (with JWT in Authorization header)
 * - Core-API uses this gateway to verify tokens
 */

import * as jose from 'jose';
import type { StackAuthUser } from '../../application/types/stack-auth.types';

// Re-export for backward compatibility
export type { StackAuthUser };

export interface StackAuthTokenPayload extends jose.JWTPayload {
  sub: string; // User ID
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

export interface StackAuthVerifierConfig {
  readonly projectId: string;
  readonly secretServerKey?: string; // Optional - for calling Stack Auth REST API
}

/**
 * Gateway for verifying Stack Auth JWT tokens
 */
export class StackAuthTokenVerifierGateway {
  private jwks: jose.JWTVerifyGetKey;

  constructor(private readonly config: StackAuthVerifierConfig) {
    // Create remote JWKS fetcher
    // Stack Auth provides public keys at this endpoint for token verification
    this.jwks = jose.createRemoteJWKSet(
      new URL(`https://api.stack-auth.com/api/v1/projects/${config.projectId}/.well-known/jwks.json`)
    );
  }

  /**
   * Verify a Stack Auth access token
   *
   * @param accessToken - JWT token from Stack Auth
   * @returns Decoded user information
   * @throws If token is invalid, expired, or verification fails
   */
  async verifyToken(accessToken: string): Promise<StackAuthUser> {
    try {
      // Verify token signature using JWKS
      const { payload } = await jose.jwtVerify<StackAuthTokenPayload>(accessToken, this.jwks, {
        // Verify the token is for our project
        audience: this.config.projectId,
        // Stack Auth uses ES256 (ECDSA with P-256 and SHA-256)
        algorithms: ['ES256']
      });

      // Extract user information from verified token
      return {
        userId: payload.sub,
        email: payload.email ?? null,
        displayName: payload.name ?? null,
        profileImageUrl: payload.picture ?? null,
        emailVerified: payload.email_verified ?? false
      };
    } catch (error: unknown) {
      if (error instanceof jose.errors.JWTExpired) {
        throw new Error('Stack Auth token has expired');
      }
      if (error instanceof jose.errors.JWTClaimValidationFailed) {
        const message = error instanceof Error ? error.message : 'Validation failed';
        throw new Error(`Stack Auth token validation failed: ${message}`);
      }
      if (error instanceof jose.errors.JWSSignatureVerificationFailed) {
        throw new Error('Stack Auth token signature verification failed');
      }
      // Re-throw other errors
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error during token verification');
    }
  }

  /**
   * Optional: Fetch full user profile from Stack Auth REST API
   *
   * This is useful if you need additional user data not included in the JWT token.
   * Requires STACK_AUTH_SECRET_SERVER_KEY to be configured.
   *
   * @param userId - Stack Auth user ID
   * @returns Full user profile from Stack Auth API
   */
  async fetchUserProfile(userId: string): Promise<unknown> {
    if (!this.config.secretServerKey) {
      throw new Error('Stack Auth secret server key is required to fetch user profiles');
    }

    const response = await fetch(
      `https://api.stack-auth.com/api/v1/projects/${this.config.projectId}/users/${userId}`,
      {
        headers: {
          'x-stack-secret-server-key': this.config.secretServerKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Stack Auth user profile: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
