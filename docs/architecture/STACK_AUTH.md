# Stack Auth Integration Architecture

## Overview

This document describes the Stack Auth integration architecture for the Whizard Platform. Stack Auth is used as the authentication provider, handling user authentication and JWT token generation. The platform uses Stack Auth in a headless mode with a custom user synchronization strategy.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Admin Portal (Angular)                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Stack Auth Service (StackAuthService)                            │  │
│  │  - Manages authentication state                                   │  │
│  │  - Stores JWT tokens in localStorage                              │  │
│  │  - Sends credentials to BFF for login                             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /iam/auth/login
                                    │ { email, password }
                                    │ withCredentials: true
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BFF (Fastify)                              │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  IAM Auth Module                                                  │  │
│  │  - Proxy authentication requests to Core API                     │  │
│  │  - CORS configuration for cross-origin requests                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /api/iam/auth/login
                                    │ { email, password }
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Core API (Fastify)                              │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  StackAuthLoginUseCase                                            │  │
│  │  1. Verify credentials with Stack Auth                           │  │
│  │  2. Sync user to local database (Just-In-Time)                   │  │
│  │  3. Return JWT tokens                                             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  StackAuthUserSyncService                                         │  │
│  │  - Create/update local UserAccount                                │  │
│  │  - Activate user on first login                                   │  │
│  │  - Track lastLoginAt on every login                               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  StackAuthTokenVerifierGateway                                    │  │
│  │  - Verify JWT tokens using JWKS                                   │  │
│  │  - Decode user information from tokens                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /api/v1/auth/password/sign-in
                                    │ Stack Auth REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Stack Auth API                                 │
│  - User authentication                                                  │
│  - JWT token generation                                                 │
│  - User management                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Store user data
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                              │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  UserAccount Table                                                │  │
│  │  - id                                                             │  │
│  │  - email                                                          │  │
│  │  - stackAuthUserId (links to Stack Auth user)                    │  │
│  │  - status (PENDING, ACTIVE, etc.)                                │  │
│  │  - activatedAt (set on first login)                              │  │
│  │  - lastLoginAt (updated on every login)                          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Admin Portal (Frontend)

**Location:** `apps/web/admin-portal`

#### StackAuthService
**File:** `src/app/core/services/stack-auth.service.ts`

Responsibilities:
- Manage authentication state using Angular signals
- Store JWT tokens in localStorage via `TokenStorageService`
- Send login requests to BFF with `withCredentials: true`
- Handle user session validation
- Navigate users after successful authentication

Key Methods:
- `signIn(email, password)` - Authenticate user via BFF
- `signOut()` - Clear tokens and redirect to login
- `getAccessToken()` - Retrieve current access token
- `checkSession()` - Validate stored token

Configuration:
```typescript
// src/environments/environment.ts
export const environment = {
  bffApiUrl: 'http://localhost:3000',
  stackAuth: {
    projectId: 'a3f5b8a7-22d3-49d5-9f56-76e0489e8d51',
    publishableClientKey: 'pck_pd36qj7jeyemw01c5a7k1s1bfvkbm7servsmxrnkav8z8'
  }
};
```

#### HTTP Configuration
**File:** `src/app/app.config.ts`

- Uses Angular HttpClient with interceptors
- Auth interceptor adds Bearer token to outgoing requests
- Credentials enabled for cross-origin requests via `withCredentials: true`

### 2. BFF (Backend for Frontend)

**Location:** `apps/api/bff`

#### IAM Auth Module
**File:** `src/modules/iam/auth/auth.module.ts`

Responsibilities:
- Proxy authentication requests to Core API
- Handle CORS for cross-origin requests from frontend
- Forward responses back to frontend

CORS Configuration:
```typescript
// src/server.ts
const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:4200';
const corsOrigins = corsOriginEnv.split(',').map(origin => origin.trim());
await fastify.register(cors, {
  origin: corsOrigins,  // ['http://localhost:4200', 'http://admin-portal:80']
  credentials: true
});
```

Routes:
- `POST /iam/auth/login` → `POST /api/iam/auth/login` (Core API)

### 3. Core API (Backend)

**Location:** `apps/api/core-api`

#### StackAuthLoginUseCase
**File:** `libs/contexts/identity-access/src/application/use-cases/stack-auth-login.use-case.ts`

Flow:
1. Receive email/password from BFF
2. Call Stack Auth API to verify credentials
3. Extract user information from Stack Auth response
4. Sync user to local database (Just-In-Time sync)
5. Return JWT tokens and user data to frontend

```typescript
async execute(input: StackAuthLoginInput): Promise<StackAuthLoginOutput> {
  // 1. Sign in with Stack Auth
  const stackAuthResponse = await this.stackAuthGateway.signIn(
    input.email,
    input.password
  );

  // 2. Sync user to local database
  const userAccount = await this.stackAuthUserSyncService.syncUser(
    stackAuthResponse.user
  );

  // 3. Return tokens and user data
  return {
    success: true,
    data: {
      accessToken: stackAuthResponse.accessToken,
      refreshToken: stackAuthResponse.refreshToken,
      expiresAt: stackAuthResponse.expiresAt,
      userAccountId: userAccount.id.value,
      email: userAccount.email.value
    }
  };
}
```

#### StackAuthUserSyncService
**File:** `libs/contexts/identity-access/src/application/services/stack-auth-user-sync.service.ts`

Responsibilities:
- Implement Just-In-Time user synchronization
- Create local UserAccount on first login
- Update existing UserAccount on subsequent logins
- Activate user on first login
- Track login timestamps

```typescript
async syncUser(stackAuthUser: StackAuthUser): Promise<UserAccount> {
  const now = new Date();

  // Check if user exists locally
  if (stackAuthUser.email) {
    const existingUser = await this.userAccountRepository.findByEmail(
      stackAuthUser.email
    );

    if (existingUser) {
      // Update last login timestamp
      existingUser.markLogin(now);
      await this.userAccountRepository.save(existingUser);
      return existingUser;
    }
  }

  // Create new user
  return this.createLocalUserFromStackAuth(stackAuthUser, now);
}

private async createLocalUserFromStackAuth(
  stackAuthUser: StackAuthUser,
  now: Date
): Promise<UserAccount> {
  // Create UserAccount aggregate
  const userAccount = UserAccount.registerLocal({
    id: userAccountId,
    email,
    tenant,
    mfaRequired: this.config.mfaRequired,
    stackAuthUserId: stackAuthUser.userId,  // Link to Stack Auth
    now
  });

  // Activate immediately on first login
  userAccount.activate(now);

  // Mark first login
  userAccount.markLogin(now);

  await this.userAccountRepository.save(userAccount);
  return userAccount;
}
```

#### StackAuthTokenVerifierGateway
**File:** `libs/contexts/identity-access/src/infrastructure/security/stack-auth-token-verifier.gateway.ts`

Responsibilities:
- Verify JWT tokens using JWKS (JSON Web Key Set)
- Decode user information from JWT payload
- Validate token expiration and signature

Configuration:
```typescript
export interface StackAuthConfig {
  projectId: string;
  secretServerKey: string;
  publishableClientKey: string;
  defaultTenantType: string;
  defaultTenantId: string;
  mfaRequired: boolean;
}
```

### 4. Domain Layer

#### UserAccount Aggregate
**File:** `libs/contexts/identity-access/src/domain/aggregates/user-identity/user-account.aggregate.ts`

Fields:
- `id: UserAccountId` - Unique identifier
- `email: EmailAddress` - User email (value object)
- `tenant: TenantRef` - Tenant reference
- `status: AccountStatus` - PENDING, ACTIVE, SUSPENDED, etc.
- `stackAuthUserId: string | null` - Stack Auth user ID (link to external system)
- `activatedAt: Date | null` - First login timestamp
- `lastLoginAt: Date | null` - Most recent login timestamp
- `createdAt: Date` - Account creation timestamp

Key Methods:
- `registerLocal()` - Create new user account
- `activate(now: Date)` - Activate user account
- `markLogin(now: Date)` - Update last login timestamp

#### Repository
**File:** `libs/contexts/identity-access/src/infrastructure/persistence/postgres/repositories/prisma-user-account.repository.ts`

Persistence:
```typescript
async save(userAccount: UserAccount): Promise<void> {
  const model = userAccount.toPrimitives();

  await this.prisma.userAccount.upsert({
    where: { id: model.id },
    update: {
      email: model.email,
      stackAuthUserId: model.stackAuthUserId,
      activatedAt: model.activatedAt,
      lastLoginAt: model.lastLoginAt,
      // ... other fields
    },
    create: {
      // ... all fields
    }
  });
}
```

## Authentication Flow

### Login Flow

1. **User submits credentials** (Admin Portal)
   - User enters email/password in login form
   - `StackAuthService.signIn()` is called

2. **Request sent to BFF** (Admin Portal → BFF)
   - POST `/iam/auth/login`
   - Headers: `Content-Type: application/json`
   - Credentials: `withCredentials: true`
   - Body: `{ email, password }`

3. **BFF proxies to Core API** (BFF → Core API)
   - POST `/api/iam/auth/login`
   - Body: `{ email, password }`

4. **Core API authenticates with Stack Auth** (Core API → Stack Auth)
   - POST `https://api.stack-auth.com/api/v1/auth/password/sign-in`
   - Headers:
     - `x-stack-project-id`
     - `x-stack-publishable-client-key`
     - `x-stack-access-type: server`
     - `x-stack-secret-server-key`
   - Body: `{ email, password }`

5. **Stack Auth returns JWT tokens**
   - Response includes:
     - `access_token` (JWT)
     - `refresh_token`
     - `user_id`
     - User metadata

6. **Core API syncs user** (Just-In-Time)
   - `StackAuthUserSyncService.syncUser()` called
   - Check if user exists by email
   - If new user:
     - Create UserAccount aggregate
     - Set `stackAuthUserId`
     - Activate account (`activatedAt = now`)
     - Mark first login (`lastLoginAt = now`)
   - If existing user:
     - Update `lastLoginAt`
   - Save to database

7. **Core API returns tokens to BFF**
   - Response:
     ```json
     {
       "success": true,
       "data": {
         "accessToken": "eyJ...",
         "refreshToken": "eyJ...",
         "expiresAt": "2026-03-14T14:30:00Z",
         "userAccountId": "uuid",
         "email": "user@example.com"
       }
     }
     ```

8. **BFF returns tokens to Admin Portal**
   - Same response forwarded to frontend

9. **Admin Portal stores tokens** (StackAuthService)
   - Store in localStorage via `TokenStorageService`
   - Update authentication state (signals)
   - Navigate to dashboard

### Token Usage Flow

1. **User makes API request** (Admin Portal → BFF)
   - Auth interceptor adds `Authorization: Bearer <token>`
   - Request sent to BFF

2. **BFF forwards to Core API**
   - Token included in headers

3. **Core API verifies token**
   - `StackAuthTokenVerifierGateway` validates JWT
   - Verify signature using JWKS
   - Check expiration
   - Extract user information

4. **Request processed**
   - User context available for authorization
   - Business logic executed

## Configuration

### Environment Variables

#### Core API
```bash
# Stack Auth Configuration
STACK_AUTH_PROJECT_ID="a3f5b8a7-22d3-49d5-9f56-76e0489e8d51"
STACK_AUTH_SECRET_SERVER_KEY="ssk_r3h4wxtrgpezgbzsvtned8t6mehvj6vew9hq2b49rvv68"
STACK_AUTH_PUBLISHABLE_CLIENT_KEY="pck_pd36qj7jeyemw01c5a7k1s1bfvkbm7servsmxrnkav8z8"

# User Sync Configuration
STACK_AUTH_DEFAULT_TENANT_TYPE="SYSTEM"
STACK_AUTH_DEFAULT_TENANT_ID="system"
STACK_AUTH_MFA_REQUIRED="false"
```

#### BFF
```bash
# CORS Configuration
CORS_ORIGIN="http://localhost:4200,http://admin-portal:80"

# Core API Connection
CORE_API_URL="http://localhost:3001"
```

#### Admin Portal
```typescript
// environment.ts
export const environment = {
  bffApiUrl: 'http://localhost:3000',
  stackAuth: {
    projectId: 'a3f5b8a7-22d3-49d5-9f56-76e0489e8d51',
    publishableClientKey: 'pck_pd36qj7jeyemw01c5a7k1s1bfvkbm7servsmxrnkav8z8'
  }
};
```

### Docker Compose

See `docker-compose.yml` for production configuration with all environment variables.

## Security Considerations

### CORS Configuration

- BFF accepts requests from multiple origins (localhost and Docker network)
- Credentials enabled for token-based authentication
- Origins split from comma-separated string to array

```typescript
const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:4200';
const corsOrigins = corsOriginEnv.split(',').map(origin => origin.trim());
```

### Token Storage

- JWT tokens stored in browser localStorage
- Tokens included in Authorization header for API requests
- `withCredentials: true` for cross-origin requests with credentials

### Token Verification

- Tokens verified on every request using JWKS
- Signature validation ensures token integrity
- Expiration checked to prevent stale tokens

### Password Security

- Passwords never stored in local database
- Password validation handled entirely by Stack Auth
- Stack Auth uses industry-standard hashing (bcrypt)

## User Synchronization Strategy

### Just-In-Time (JIT) Sync

The platform uses a **Just-In-Time synchronization strategy** where users are synced from Stack Auth to the local database only when they log in.

**Advantages:**
- No background sync jobs required
- Always up-to-date user data
- Minimal data duplication
- Automatic cleanup (inactive users not synced)

**Flow:**
1. User logs in with Stack Auth
2. Stack Auth validates credentials
3. Core API checks if user exists locally
4. If new: Create UserAccount with Stack Auth user ID
5. If existing: Update last login timestamp
6. Return tokens to user

### Data Consistency

- `stackAuthUserId` field links local user to Stack Auth user
- Email used as lookup key for existing users
- Single source of truth: Stack Auth for authentication, local DB for application data

## Database Schema

```sql
CREATE TABLE "UserAccount" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "stackAuthUserId" TEXT,
  "tenantId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "mfaRequired" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "activatedAt" TIMESTAMP,
  "lastLoginAt" TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,

  CONSTRAINT "UserAccount_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
);

CREATE INDEX "UserAccount_email_idx" ON "UserAccount"("email");
CREATE INDEX "UserAccount_stackAuthUserId_idx" ON "UserAccount"("stackAuthUserId");
```

## Key Design Decisions

### 1. Headless Mode
**Decision:** Use Stack Auth in headless mode instead of hosted UI

**Rationale:**
- Full control over UI/UX
- Consistent branding with platform
- Custom validation and error handling
- Integration with existing Angular components

### 2. BFF Pattern
**Decision:** Route all authentication through BFF instead of direct Stack Auth calls

**Rationale:**
- Centralized authentication logic
- CORS handling in one place
- Ability to add custom middleware/logging
- Easier to switch auth providers in future

### 3. JIT User Sync
**Decision:** Sync users on login instead of background sync

**Rationale:**
- Simpler implementation (no sync jobs)
- Always current data
- Lower database storage
- Automatic handling of new users

### 4. Token Storage in localStorage
**Decision:** Store JWT tokens in localStorage instead of httpOnly cookies

**Rationale:**
- Easier to access for API requests
- Works well with SPA architecture
- Stack Auth SDK uses localStorage
- Acceptable risk for internal admin portal

### 5. Dual Tracking (activatedAt, lastLoginAt)
**Decision:** Track both first login (activation) and most recent login

**Rationale:**
- Distinguish between account creation and first use
- Enable user engagement analytics
- Support compliance requirements (e.g., inactive user cleanup)

## Future Enhancements

### Potential Improvements

1. **Refresh Token Rotation**
   - Implement automatic token refresh
   - Add refresh token endpoint in BFF
   - Handle token expiration gracefully

2. **Multi-Factor Authentication (MFA)**
   - Enable Stack Auth MFA features
   - Add MFA enrollment flow
   - Support TOTP/SMS verification

3. **Social Login**
   - Add OAuth providers (Google, GitHub, etc.)
   - Configure Stack Auth social connections
   - Update sync logic for social profiles

4. **User Profile Sync**
   - Sync additional user metadata from Stack Auth
   - Add profile update endpoints
   - Two-way sync for profile changes

5. **Role-Based Access Control (RBAC)**
   - Map Stack Auth roles to local permissions
   - Sync role assignments on login
   - Implement permission checks in Core API

6. **Audit Logging**
   - Log all authentication events
   - Track failed login attempts
   - Monitor suspicious activity

## Troubleshooting

### CORS Errors

**Symptom:** Request fails with status 0, no error message in browser console

**Cause:** CORS origin mismatch or credentials not enabled

**Solution:**
1. Check BFF CORS configuration includes correct origin
2. Ensure `withCredentials: true` in HTTP request
3. Verify CORS_ORIGIN environment variable is set correctly
4. Check that origin is split into array (not comma-separated string)

### Token Verification Failures

**Symptom:** 401 Unauthorized errors on API requests

**Cause:** Invalid token, expired token, or JWKS verification failure

**Solution:**
1. Check token expiration in localStorage
2. Verify Stack Auth project ID matches configuration
3. Ensure Stack Auth secret server key is correct
4. Check network connectivity to Stack Auth JWKS endpoint

### User Not Found After Login

**Symptom:** Login succeeds but user data missing in database

**Cause:** User sync service failed or database transaction error

**Solution:**
1. Check Core API logs for sync errors
2. Verify database connection
3. Check Prisma schema matches UserAccount aggregate
4. Ensure stackAuthUserId is being set correctly

## References

- [Stack Auth Documentation](https://docs.stack-auth.com/)
- [Stack Auth REST API](https://docs.stack-auth.com/rest-api/auth)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [CORS Specification](https://fetch.spec.whatwg.org/#http-cors-protocol)
