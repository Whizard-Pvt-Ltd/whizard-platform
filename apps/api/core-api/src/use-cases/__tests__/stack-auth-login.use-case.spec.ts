/**
 * Stack Auth Login Use Case - Unit Tests
 *
 * Tests the login workflow business logic with mocked dependencies.
 * No external API calls, no database - pure unit testing.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { StackAuthLoginUseCase } from '../stack-auth-login.use-case';
import type {
  StackAuthTokenVerifierGateway,
  StackAuthUserSyncService,
  StackAuthUser
} from '@whizard/identity-access';

describe('StackAuthLoginUseCase', () => {
  let useCase: StackAuthLoginUseCase;
  let mockTokenVerifier: StackAuthTokenVerifierGateway;
  let mockUserSyncService: StackAuthUserSyncService;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create mock dependencies
    mockTokenVerifier = {
      verifyToken: vi.fn()
    } as unknown as StackAuthTokenVerifierGateway;

    mockUserSyncService = {
      syncUser: vi.fn()
    } as unknown as StackAuthUserSyncService;

    // Mock global fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Create use case instance
    useCase = new StackAuthLoginUseCase({
      tokenVerifier: mockTokenVerifier,
      userSyncService: mockUserSyncService
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('execute() - Success Cases', () => {
    it('successfully authenticates user with valid credentials', async () => {
      // Arrange
      const mockStackAuthResponse = {
        access_token: createMockJWT({ sub: 'stack-user-123', exp: 9999999999 }),
        refresh_token: 'refresh_abc123',
        user_id: 'stack-user-123',
        email: 'test@example.com'
      };

      const mockVerifiedUser: StackAuthUser = {
        userId: 'stack-user-123',
        email: 'test@example.com',
        emailVerified: true,
        displayName: null,
        profileImageUrl: null
      };

      const mockLocalUser = {
        id: { value: 'local-user-456' },
        email: { value: 'test@example.com' }
      };

      // Mock Stack Auth API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStackAuthResponse
      });

      // Mock token verification
      vi.mocked(mockTokenVerifier.verifyToken).mockResolvedValue(mockVerifiedUser);

      // Mock user sync
      vi.mocked(mockUserSyncService.syncUser).mockResolvedValue(mockLocalUser as unknown as Awaited<ReturnType<StackAuthUserSyncService['syncUser']>>);

      // Act
      const result = await useCase.execute({
        request: {
          payload: {
            email: 'test@example.com',
            password: 'SecurePass123!'
          }
        }
      });

      // Assert - Verify return value
      expect(result.data).toBeDefined();
      expect(result.data?.userAccountId).toBe('local-user-456');
      expect(result.data?.sessionId).toBe('stack-user-123');
      expect(result.data?.accessToken).toBe(mockStackAuthResponse.access_token);
      expect(result.data?.refreshToken).toBe(mockStackAuthResponse.refresh_token);
      expect(result.data?.expiresAt).toBeDefined();

      // Assert - Verify Stack Auth API was called correctly
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.stack-auth.com/api/v1/auth/password/sign-in',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-stack-project-id': expect.any(String)
          }),
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'SecurePass123!'
          })
        })
      );

      // Assert - Verify token was verified
      expect(mockTokenVerifier.verifyToken).toHaveBeenCalledTimes(1);
      expect(mockTokenVerifier.verifyToken).toHaveBeenCalledWith(mockStackAuthResponse.access_token);

      // Assert - Verify user was synced to database
      expect(mockUserSyncService.syncUser).toHaveBeenCalledTimes(1);
      expect(mockUserSyncService.syncUser).toHaveBeenCalledWith(mockVerifiedUser);
    });

    it('calculates token expiration from JWT exp claim', async () => {
      // Arrange - Token with specific expiration (2025-01-01 00:00:00 UTC = 1735689600)
      const expTimestamp = 1735689600;
      const mockToken = createMockJWT({ sub: 'user-123', exp: expTimestamp });

      const mockStackAuthResponse = {
        access_token: mockToken,
        refresh_token: 'refresh_token',
        user_id: 'stack-user-123',
        email: 'test@example.com'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStackAuthResponse
      });

      vi.mocked(mockTokenVerifier.verifyToken).mockResolvedValue({
        userId: 'stack-user-123',
        email: 'test@example.com',
        emailVerified: true,
        displayName: null,
        profileImageUrl: null
      });

      vi.mocked(mockUserSyncService.syncUser).mockResolvedValue({
        id: { value: 'local-user-456' },
        email: { value: 'test@example.com' }
      } as unknown as Awaited<ReturnType<StackAuthUserSyncService['syncUser']>>);

      // Act
      const result = await useCase.execute({
        request: {
          payload: {
            email: 'test@example.com',
            password: 'SecurePass123!'
          }
        }
      });

      // Assert
      expect(result.data?.expiresAt).toBe('2025-01-01T00:00:00.000Z');
    });

    it('handles user with unverified email', async () => {
      // Arrange
      const mockStackAuthResponse = {
        access_token: createMockJWT({ sub: 'user-123', exp: 9999999999 }),
        refresh_token: 'refresh_token',
        user_id: 'stack-user-123',
        email: 'unverified@example.com'
      };

      const mockVerifiedUser: StackAuthUser = {
        userId: 'stack-user-123',
        email: 'unverified@example.com',
        emailVerified: false, // Unverified
        displayName: null,
        profileImageUrl: null
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStackAuthResponse
      });

      vi.mocked(mockTokenVerifier.verifyToken).mockResolvedValue(mockVerifiedUser);

      vi.mocked(mockUserSyncService.syncUser).mockResolvedValue({
        id: { value: 'local-user-456' },
        email: { value: 'unverified@example.com' }
      } as unknown as Awaited<ReturnType<StackAuthUserSyncService['syncUser']>>);

      // Act
      const result = await useCase.execute({
        request: {
          payload: {
            email: 'unverified@example.com',
            password: 'SecurePass123!'
          }
        }
      });

      // Assert - Should still succeed (email verification is optional)
      expect(result.data?.userAccountId).toBe('local-user-456');
    });
  });

  describe('execute() - Validation Errors', () => {
    it('throws error when email is missing', async () => {
      // Act & Assert
      await expect(
        useCase.execute({
          request: {
            payload: {
              password: 'SecurePass123!'
            }
          }
        })
      ).rejects.toThrow('Email and password are required');

      // Verify no API calls were made
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('throws error when email is empty string', async () => {
      await expect(
        useCase.execute({
          request: {
            payload: {
              email: '',
              password: 'SecurePass123!'
            }
          }
        })
      ).rejects.toThrow('Email and password are required');
    });

    it('throws error when password is missing', async () => {
      await expect(
        useCase.execute({
          request: {
            payload: {
              email: 'test@example.com'
            }
          }
        })
      ).rejects.toThrow('Email and password are required');
    });

    it('throws error when password is empty string', async () => {
      await expect(
        useCase.execute({
          request: {
            payload: {
              email: 'test@example.com',
              password: ''
            }
          }
        })
      ).rejects.toThrow('Email and password are required');
    });
  });

  describe('execute() - Stack Auth API Errors', () => {
    it('throws error when Stack Auth returns 401 (invalid credentials)', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' })
      });

      // Act & Assert
      await expect(
        useCase.execute({
          request: {
            payload: {
              email: 'test@example.com',
              password: 'WrongPassword'
            }
          }
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('throws error when Stack Auth returns 400 (bad request)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' })
      });

      await expect(
        useCase.execute({
          request: {
            payload: {
              email: 'invalid-email',
              password: 'password'
            }
          }
        })
      ).rejects.toThrow('Bad request');
    });

    it('throws error when Stack Auth returns 500 (server error)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      await expect(
        useCase.execute({
          request: {
            payload: {
              email: 'test@example.com',
              password: 'SecurePass123!'
            }
          }
        })
      ).rejects.toThrow('Internal server error');
    });

    it('handles Stack Auth API returning malformed JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      await expect(
        useCase.execute({
          request: {
            payload: {
              email: 'test@example.com',
              password: 'SecurePass123!'
            }
          }
        })
      ).rejects.toThrow();
    });

    it('throws error when Stack Auth does not return access_token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          refresh_token: 'refresh_token',
          user_id: 'user-123'
          // Missing access_token
        })
      });

      await expect(
        useCase.execute({
          request: {
            payload: {
              email: 'test@example.com',
              password: 'SecurePass123!'
            }
          }
        })
      ).rejects.toThrow('Stack Auth did not return tokens');
    });

    it('throws error when Stack Auth does not return refresh_token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: createMockJWT({ sub: 'user-123', exp: 9999999999 }),
          user_id: 'user-123'
          // Missing refresh_token
        })
      });

      await expect(
        useCase.execute({
          request: {
            payload: {
              email: 'test@example.com',
              password: 'SecurePass123!'
            }
          }
        })
      ).rejects.toThrow('Stack Auth did not return tokens');
    });
  });

  describe('execute() - Token Verification Errors', () => {
    it('throws error when token verification fails', async () => {
      const mockStackAuthResponse = {
        access_token: 'invalid_jwt_token',
        refresh_token: 'refresh_token',
        user_id: 'user-123',
        email: 'test@example.com'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStackAuthResponse
      });

      vi.mocked(mockTokenVerifier.verifyToken).mockRejectedValue(
        new Error('Invalid token signature')
      );

      await expect(
        useCase.execute({
          request: {
            payload: {
              email: 'test@example.com',
              password: 'SecurePass123!'
            }
          }
        })
      ).rejects.toThrow('Invalid token signature');
    });

    it('throws error when token is expired', async () => {
      const mockStackAuthResponse = {
        access_token: createMockJWT({ sub: 'user-123', exp: 1000000000 }), // Old timestamp
        refresh_token: 'refresh_token',
        user_id: 'user-123',
        email: 'test@example.com'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStackAuthResponse
      });

      vi.mocked(mockTokenVerifier.verifyToken).mockRejectedValue(new Error('Token expired'));

      await expect(
        useCase.execute({
          request: {
            payload: {
              email: 'test@example.com',
              password: 'SecurePass123!'
            }
          }
        })
      ).rejects.toThrow('Token expired');
    });
  });

  describe('execute() - User Sync Errors', () => {
    it('throws error when user sync fails', async () => {
      const mockStackAuthResponse = {
        access_token: createMockJWT({ sub: 'user-123', exp: 9999999999 }),
        refresh_token: 'refresh_token',
        user_id: 'stack-user-123',
        email: 'test@example.com'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStackAuthResponse
      });

      vi.mocked(mockTokenVerifier.verifyToken).mockResolvedValue({
        userId: 'stack-user-123',
        email: 'test@example.com',
        emailVerified: true,
        displayName: null,
        profileImageUrl: null
      });

      vi.mocked(mockUserSyncService.syncUser).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        useCase.execute({
          request: {
            payload: {
              email: 'test@example.com',
              password: 'SecurePass123!'
            }
          }
        })
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('execute() - Edge Cases', () => {
    it('handles JWT without exp claim gracefully', async () => {
      // Token without exp claim
      const tokenWithoutExp = createMockJWT({ sub: 'user-123' }); // No exp

      const mockStackAuthResponse = {
        access_token: tokenWithoutExp,
        refresh_token: 'refresh_token',
        user_id: 'stack-user-123',
        email: 'test@example.com'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStackAuthResponse
      });

      vi.mocked(mockTokenVerifier.verifyToken).mockResolvedValue({
        userId: 'stack-user-123',
        email: 'test@example.com',
        emailVerified: true,
        displayName: null,
        profileImageUrl: null
      });

      vi.mocked(mockUserSyncService.syncUser).mockResolvedValue({
        id: { value: 'local-user-456' },
        email: { value: 'test@example.com' }
      } as unknown as Awaited<ReturnType<StackAuthUserSyncService['syncUser']>>);

      const result = await useCase.execute({
        request: {
          payload: {
            email: 'test@example.com',
            password: 'SecurePass123!'
          }
        }
      });

      // Should use fallback expiration (30 minutes from now)
      expect(result.data?.expiresAt).toBeDefined();
      const expiresAt = new Date(result.data!.expiresAt as string);
      const now = new Date();
      const diffMinutes = (expiresAt.getTime() - now.getTime()) / 1000 / 60;

      expect(diffMinutes).toBeGreaterThan(29);
      expect(diffMinutes).toBeLessThan(31);
    });

    it('handles malformed JWT gracefully', async () => {
      const malformedToken = 'not.a.valid.jwt.token.format';

      const mockStackAuthResponse = {
        access_token: malformedToken,
        refresh_token: 'refresh_token',
        user_id: 'stack-user-123',
        email: 'test@example.com'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStackAuthResponse
      });

      vi.mocked(mockTokenVerifier.verifyToken).mockResolvedValue({
        userId: 'stack-user-123',
        email: 'test@example.com',
        emailVerified: true,
        displayName: null,
        profileImageUrl: null
      });

      vi.mocked(mockUserSyncService.syncUser).mockResolvedValue({
        id: { value: 'local-user-456' },
        email: { value: 'test@example.com' }
      } as unknown as Awaited<ReturnType<StackAuthUserSyncService['syncUser']>>);

      const result = await useCase.execute({
        request: {
          payload: {
            email: 'test@example.com',
            password: 'SecurePass123!'
          }
        }
      });

      // Should use fallback expiration
      expect(result.data?.expiresAt).toBeDefined();
    });
  });
});

// Helper function to create mock JWT tokens
function createMockJWT(payload: Record<string, unknown>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'mock_signature';

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
