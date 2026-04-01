/**
 * Stack Auth User Sync Service
 *
 * Synchronizes Stack Auth users to local database.
 *
 * Flow:
 * 1. User logs in via Angular -> Stack Auth API
 * 2. Angular receives JWT token
 * 3. Angular sends request to BFF with token
 * 4. Core-API verifies token (using StackAuthTokenVerifierGateway)
 * 5. Core-API calls this service to sync user to local DB (if not exists)
 * 6. Local user record is used for app-specific data (roles, permissions, etc.)
 *
 * Architecture Note:
 * - Stack Auth is the "source of truth" for authentication
 * - Local DB stores app-specific user data and relationships
 * - User ID from Stack Auth (sub claim) is stored as external identifier
 */

import type { UserAccountRepository } from '../ports/repositories/user-account.repository';
import type { StackAuthUser } from '../types/stack-auth.types';
import { UserAccount } from '../../domain/aggregates/user-identity/user-account.aggregate';
import { EmailAddress } from '../../domain/value-objects/email-address.vo';
import { TenantRef } from '../../domain/value-objects/tenant-ref.vo';
import { UserAccountId } from '../../domain/value-objects/user-account-id.vo';

export interface StackAuthUserSyncConfig {
  /**
   * Default tenant for new users
   * In most cases, users will be assigned to SYSTEM tenant initially
   */
  readonly defaultTenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
  readonly defaultTenantId: string;

  /**
   * Whether to require MFA for new users
   * Stack Auth handles MFA, but this flag is for app-level requirements
   */
  readonly mfaRequired: boolean;
}

/**
 * Service for syncing Stack Auth users to local database
 */
export class StackAuthUserSyncService {
  constructor(
    private readonly userAccountRepository: UserAccountRepository,
    private readonly config: StackAuthUserSyncConfig
  ) {}

  /**
   * Sync a Stack Auth user to local database
   *
   * - If user exists (by email), returns existing account
   * - If user doesn't exist, creates new account
   * - Stores Stack Auth user ID as external identifier
   *
   * @param stackAuthUser - User info from verified Stack Auth token
   * @returns Local user account
   */
  async syncUser(stackAuthUser: StackAuthUser): Promise<UserAccount> {
    const now = new Date();

    // Check if user already exists in local DB by email
    if (stackAuthUser.email) {
      const existingUser = await this.userAccountRepository.findByEmail(stackAuthUser.email);

      if (existingUser) {
        // User already exists - mark login and save
        existingUser.markLogin(now);
        await this.userAccountRepository.save(existingUser);
        return existingUser;
      }
    }

    // User doesn't exist - create new local account
    return this.createLocalUserFromStackAuth(stackAuthUser, now);
  }

  /**
   * Create a new local user account from Stack Auth user data
   *
   * @param stackAuthUser - User info from Stack Auth
   * @param now - Current timestamp
   * @returns Newly created user account
   */
  private async createLocalUserFromStackAuth(stackAuthUser: StackAuthUser, now: Date): Promise<UserAccount> {
    // Generate new local user account ID
    const userAccountId = UserAccountId.create();

    // Create email value object
    // If Stack Auth user has no email, use a placeholder (edge case)
    const email = EmailAddress.create(
      stackAuthUser.email ?? `user-${stackAuthUser.userId}@stack-auth.placeholder`
    );

    // Create tenant reference (default tenant for new users)
    const tenant = TenantRef.create({
      tenantType: this.config.defaultTenantType,
      tenantId: this.config.defaultTenantId
    });

    // Register new user account with Stack Auth user ID
    const userAccount = UserAccount.registerLocal({
      id: userAccountId,
      email,
      tenant,
      mfaRequired: this.config.mfaRequired,
      stackAuthUserId: stackAuthUser.userId,
      now
    });

    // Activate the account immediately on first login since Stack Auth already verified them
    userAccount.activate(now);

    // Mark the first login
    userAccount.markLogin(now);

    // Save the new user account
    await this.userAccountRepository.save(userAccount);

    return userAccount;
  }

  /**
   * Find local user by Stack Auth user ID
   *
   * This is useful when we have the Stack Auth user ID but need the local user account.
   * Currently uses email for lookup, but should be enhanced to use external identifier table.
   *
   * @param stackAuthUserId - Stack Auth user ID (from token sub claim)
   * @returns Local user account or null
   */
  async findLocalUserByStackAuthId(stackAuthUserId: string): Promise<UserAccount | null> {
    // TODO: Implement proper external identifier lookup
    // For now, this is a placeholder
    // In production, query the federated identity / external identifier binding table
    // to find the local user ID associated with this Stack Auth user ID

    // Temporary implementation - this won't work without email
    // throw new Error('Stack Auth user ID lookup not yet implemented. Use email lookup instead.');

    return null;
  }
}

/**
 * Load Stack Auth User Sync configuration from environment
 */
type TenantType = 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';

const isTenantType = (value: string | undefined): value is TenantType => {
  return value === 'SYSTEM' || value === 'PARENT_CLUB' || value === 'COLLEGE' || value === 'COMPANY';
};

export const loadStackAuthUserSyncConfig = (): StackAuthUserSyncConfig => {
  const tenantType = process.env.STACK_AUTH_DEFAULT_TENANT_TYPE;

  return {
    // Default to SYSTEM tenant for new users
    defaultTenantType: isTenantType(tenantType) ? tenantType : 'SYSTEM',
    defaultTenantId: process.env.STACK_AUTH_DEFAULT_TENANT_ID || 'system',

    // Default to not requiring MFA (Stack Auth handles it)
    mfaRequired: process.env.STACK_AUTH_MFA_REQUIRED === 'true'
  };
};
