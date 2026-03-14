import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StackAuthService } from '../services/stack-auth.service';

/**
 * Auth Interceptor
 *
 * Automatically adds Stack Auth JWT tokens to outgoing HTTP requests.
 * The token is added as a Bearer token in the Authorization header.
 *
 * Flow:
 * 1. Intercepts all HTTP requests
 * 2. Gets access token from StackAuthService
 * 3. Adds Authorization: Bearer <token> header
 * 4. Forwards request to backend
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const stackAuthService = inject(StackAuthService);
  const token = stackAuthService.getAccessToken();

  // Clone the request and add authorization header if token exists
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
