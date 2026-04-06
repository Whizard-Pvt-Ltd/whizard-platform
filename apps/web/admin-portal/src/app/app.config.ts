import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@whizard/icons';
import { LAYOUT_AUTH_SERVICE, NAVIGATION_ITEMS } from '@whizard/shared-ui';
import { provideTheming } from '@whizard/theme';
import { routes } from './app.routes';
import { ADMIN_NAVIGATION } from './core/data/navigation';
import { initializeStackAuth } from './core/initializers/stack-auth.initializer';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { StackAuthService } from './core/services/stack-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideIcons(),
    provideTheming({
      scheme: 'dark',
      primary: '#1565C0',
      error: '#dc2626',
    }),

    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),

    {
      provide: APP_INITIALIZER,
      useFactory: initializeStackAuth,
      multi: true,
    },

    // Material
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
    provideNativeDateAdapter(),

    // Layout
    { provide: NAVIGATION_ITEMS, useValue: ADMIN_NAVIGATION },
    { provide: LAYOUT_AUTH_SERVICE, useExisting: StackAuthService },
  ],
};
