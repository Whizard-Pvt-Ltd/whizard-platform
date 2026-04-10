/**
 * Stack Auth Initializer
 *
 * Angular APP_INITIALIZER that initializes Stack Auth SDK on app startup,
 * then loads the current user's tenant context (for tenant dropdown etc.).
 */

import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthContextService } from '../services/auth-context.service';
import { StackAuthService } from '../services/stack-auth.service';

export function initializeStackAuth(): () => Promise<void> {
  const stackAuthService = inject(StackAuthService);
  const authContext = inject(AuthContextService);

  return async () => {
    await stackAuthService.initialize(environment.stackAuth);
    if (stackAuthService.isAuthenticated()) {
      await firstValueFrom(authContext.load());
    }
  };
}
