/**
 * Core API Client
 *
 * HTTP client for BFF to communicate with Core-API backend service.
 * Handles authentication, request/response formatting, and error handling.
 */

export interface CoreApiClientConfig {
  readonly baseUrl: string;
  readonly timeout?: number;
}

export interface CoreApiRequest {
  readonly actorUserAccountId: string;
  readonly tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
  readonly tenantId: string;
  readonly payload: Record<string, unknown>;
}

export interface CoreApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

export class CoreApiClient {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: CoreApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout ?? 30000; // 30 seconds default
  }

  /**
   * POST request to Core-API
   */
  async post<TResponse = unknown>(
    path: string,
    request: CoreApiRequest,
    headers?: Record<string, string>
  ): Promise<CoreApiResponse<TResponse>> {
    const url = `${this.baseUrl}${path}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Pass context in headers like Core-API expects
          'X-Actor-User-Account-Id': request.actorUserAccountId,
          'X-Tenant-Type': request.tenantType,
          'X-Tenant-Id': request.tenantId,
          ...headers
        },
        // Send only the payload as the body, not the entire request
        body: JSON.stringify(request.payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: errorBody.code ?? 'CORE_API_ERROR',
            message: errorBody.message ?? `Core-API request failed with status ${response.status}`
          }
        };
      }

      const data = await response.json();
      return data as CoreApiResponse<TResponse>;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: `Request to Core-API timed out after ${this.timeout}ms`
          }
        };
      }

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error'
        }
      };
    }
  }

  /**
   * GET request to Core-API
   */
  async get<TResponse = unknown>(
    path: string,
    request: CoreApiRequest,
    headers?: Record<string, string>
  ): Promise<CoreApiResponse<TResponse>> {
    const url = `${this.baseUrl}${path}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Actor-User-Account-Id': request.actorUserAccountId,
          'X-Tenant-Type': request.tenantType,
          'X-Tenant-Id': request.tenantId,
          ...headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: errorBody.code ?? 'CORE_API_ERROR',
            message: errorBody.message ?? `Core-API request failed with status ${response.status}`
          }
        };
      }

      const data = await response.json();
      return data as CoreApiResponse<TResponse>;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: `Request to Core-API timed out after ${this.timeout}ms`
          }
        };
      }

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error'
        }
      };
    }
  }
}
