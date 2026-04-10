import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from './loading.service.js';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  if (!loadingService.auto$()) {
    return next(req);
  }

  loadingService._setLoadingStatus(true, req.url);

  return next(req).pipe(
    finalize(() => {
      loadingService._setLoadingStatus(false, req.url);
    }),
  );
};
