import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StackAuthService } from '../services/stack-auth.service';

/**
 * Auth Guard
 *
 * Protects routes by checking if user is authenticated with Stack Auth.
 * If not authenticated, redirects to login page with return URL.
 *
 * Usage:
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [authGuard]
 *   }
 * ];
 * ```
 */
export const authGuard: CanActivateFn = (route, state) => {
  const stackAuthService = inject(StackAuthService);
  const router = inject(Router);

  // Check if user is authenticated using Stack Auth
  if (stackAuthService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page with return URL
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
