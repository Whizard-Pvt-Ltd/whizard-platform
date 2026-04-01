/**
 * Request Context Utilities for IAM BFF
 *
 * This module provides utilities for extracting authentication and authorization context
 * from HTTP requests. It defines lightweight type interfaces for Fastify interactions
 * and helper functions for context extraction.
 *
 * The request context includes:
 * - Actor identity (who is making the request)
 * - Tenant context (which organization/tenant)
 * - Permissions (what the actor is allowed to do)
 * - Request tracking (correlation IDs)
 */
import type { ApiMetaV1 } from '@whizard/identity-access';

/**
 * Tenant types supported by the platform.
 * Represents different organizational hierarchies in the multi-tenant system.
 */
type TenantType = 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';

/**
 * Lightweight Fastify request interface.
 * Provides access to HTTP request properties without full Fastify coupling.
 */
export interface FastifyRequestLike {
  /** HTTP headers from the request */
  readonly headers: Record<string, string | string[] | undefined>;
  /** URL path parameters (e.g., /users/:id) */
  readonly params?: unknown;
  /** Query string parameters (e.g., ?page=1&limit=10) */
  readonly query?: unknown;
  /** Request body payload */
  readonly body?: unknown;
}

/**
 * Lightweight Fastify reply interface.
 * Provides methods for sending HTTP responses without full Fastify coupling.
 */
export interface FastifyReplyLike {
  /** Set HTTP status code and return reply for chaining */
  status(code: number): FastifyReplyLike;
  /** Send response payload to client */
  send(payload: unknown): void;
}

/**
 * Fastify pre-handler hook type.
 * Executed before the main route handler for middleware-like operations
 * (e.g., authentication, validation, logging).
 */
export type FastifyPreHandlerLike = (
  request: FastifyRequestLike,
  reply: FastifyReplyLike
) => Promise<void> | void;

/**
 * Lightweight Fastify route definition interface.
 * Defines the shape of HTTP route configurations.
 */
export interface FastifyRouteLike {
  /** HTTP method (GET, POST, PUT, DELETE, etc.) */
  readonly method: string;
  /** URL path pattern (e.g., /api/users/:id) */
  readonly url: string;
  /** Optional pre-handler hooks executed before the main handler */
  readonly preHandler?: FastifyPreHandlerLike | FastifyPreHandlerLike[];
  /** Main route handler function */
  readonly handler: (request: FastifyRequestLike, reply: FastifyReplyLike) => Promise<void> | void;
}

/**
 * Lightweight Fastify instance interface.
 * Provides methods for route registration and plugin installation.
 */
export interface FastifyInstanceLike {
  /** Register a new route */
  route(route: FastifyRouteLike): this;
  /** Register a plugin with optional configuration */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register(plugin: (instance: any, opts?: any) => void | Promise<void>, opts?: any): any;
}

/**
 * IAM request context extracted from HTTP headers.
 *
 * This context provides authentication and authorization information
 * used throughout the request lifecycle.
 */
export interface IamRequestContext {
  /** ID of the user account making the request (or 'anonymous' for unauthenticated) */
  readonly actorUserAccountId: string;
  /** Type of tenant context for the request */
  readonly tenantType: TenantType;
  /** ID of the tenant context for the request */
  readonly tenantId: string;
  /** Array of permission codes granted to the actor */
  readonly permissions: readonly string[];
  /** Optional request correlation ID for distributed tracing */
  readonly requestId?: string;
}

/**
 * Extracts IAM request context from HTTP request headers.
 *
 * This function reads standardized headers to build the request context:
 * - x-actor-user-account-id: Identity of the requesting user
 * - x-tenant-type: Type of organizational context
 * - x-tenant-id: Specific tenant identifier
 * - x-permissions: Comma-separated list of permission codes
 * - x-request-id: Optional correlation ID for request tracking
 *
 * @param request - Fastify-like request object
 * @returns Parsed request context with authentication/authorization info
 *
 * @example
 * ```typescript
 * const context = getRequestContext(request);
 * console.log(context.actorUserAccountId); // 'user-123'
 * console.log(context.permissions); // ['IAM.READ', 'IAM.WRITE']
 * ```
 */
export const getRequestContext = (request: FastifyRequestLike): IamRequestContext => {
  // Extract actor identity from headers (default to 'anonymous' for unauthenticated requests)
  const actorUserAccountId = String(request.headers['x-actor-user-account-id'] ?? 'anonymous');

  // Extract tenant context (defaults to SYSTEM tenant)
  const tenantType = String(request.headers['x-tenant-type'] ?? 'SYSTEM') as TenantType;
  const tenantId = String(request.headers['x-tenant-id'] ?? process.env['SYSTEM_TENANT_ID'] ?? '1');

  // Parse permissions from comma-separated header value
  const permissionsHeader = String(request.headers['x-permissions'] ?? '');

  return {
    actorUserAccountId,
    tenantType,
    tenantId,
    // Split permissions by comma, trim whitespace, and filter empty values
    permissions: permissionsHeader
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
    // Optional request ID for distributed tracing
    requestId: request.headers['x-request-id']
      ? String(request.headers['x-request-id'])
      : undefined
  };
};

/**
 * Converts request context to API metadata format.
 *
 * Creates metadata object suitable for API responses,
 * including request correlation ID and timestamp.
 *
 * @param request - Fastify-like request object
 * @returns API metadata with requestId and timestamp
 *
 * @example
 * ```typescript
 * const meta = toApiMeta(request);
 * // Returns: { requestId: 'abc-123', timestamp: '2024-03-09T10:30:00.000Z' }
 * ```
 */
export const toApiMeta = (request: FastifyRequestLike): ApiMetaV1 => {
  const context = getRequestContext(request);
  return {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  };
};
