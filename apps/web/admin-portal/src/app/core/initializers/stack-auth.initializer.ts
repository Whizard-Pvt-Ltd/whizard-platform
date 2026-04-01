/**
 * Stack Auth Initializer
 *
 * Angular APP_INITIALIZER that initializes Stack Auth SDK on app startup.
 */

import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { StackAuthService } from '../services/stack-auth.service';

export function initializeStackAuth(): () => Promise<void> {
  const stackAuthService = inject(StackAuthService);

  return () => {
    return stackAuthService.initialize(environment.stackAuth);
  };
}
