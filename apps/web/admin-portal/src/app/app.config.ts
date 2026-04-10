import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy, provideRouter, withRouterConfig } from '@angular/router';
import { provideIcons } from '@whizard/icons';
import { LAYOUT_AUTH_SERVICE, NAVIGATION_ITEMS, SIGNED_URL_PROVIDER,LAYOUT_TENANT_SERVICE } from '@whizard/shared-ui';
import { provideTheming } from '@whizard/theme';
import { routes } from './app.routes';
import { ADMIN_NAVIGATION } from './core/data/navigation';
import { initializeStackAuth } from './core/initializers/stack-auth.initializer';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthContextService } from './core/services/auth-context.service';
import { StackAuthService } from './core/services/stack-auth.service';
import { ManageInternshipApiService } from './pages/manage-internship/services/manage-internship-api.service';

class TenantAwareReuseStrategy implements RouteReuseStrategy {
  shouldDetach(): boolean { return false; }
  store(): void {}
  shouldAttach(): boolean { return false; }
  retrieve(): DetachedRouteHandle | null { return null; }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig && !!future.routeConfig?.data?.['reuse'];
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideIcons(),
    provideTheming({
      scheme: 'dark',
      primary: '#1565C0',
      error: '#dc2626',
    }),

    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
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

    { provide: RouteReuseStrategy, useClass: TenantAwareReuseStrategy },

    // Layout
    { provide: NAVIGATION_ITEMS, useValue: ADMIN_NAVIGATION },
    { provide: LAYOUT_AUTH_SERVICE, useExisting: StackAuthService },

    // Shared UI providers
    { provide: SIGNED_URL_PROVIDER, useExisting: ManageInternshipApiService },
    { provide: LAYOUT_TENANT_SERVICE, useExisting: AuthContextService },
  ],
};
