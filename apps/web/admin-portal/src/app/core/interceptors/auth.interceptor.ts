import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthContextService } from '../services/auth-context.service';
import { StackAuthService } from '../services/stack-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const stackAuthService = inject(StackAuthService);
  const authContext = inject(AuthContextService);
  const token = stackAuthService.getAccessToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const selectedTenantId = authContext.selectedTenantId();
  if (selectedTenantId) {
    headers['x-selected-tenant-id'] = selectedTenantId;
  }

  if (Object.keys(headers).length > 0) {
    return next(req.clone({ setHeaders: headers }));
  }

  return next(req);
};
