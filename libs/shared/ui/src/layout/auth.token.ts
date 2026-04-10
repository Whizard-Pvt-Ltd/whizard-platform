import { InjectionToken, Signal } from '@angular/core';

export interface LayoutUser {
  email: string | null;
  displayName: string | null;
}

export interface LayoutAuthService {
  currentUser: Signal<LayoutUser | null>;
  signOut(): Promise<void>;
}

export const LAYOUT_AUTH_SERVICE = new InjectionToken<LayoutAuthService>('LAYOUT_AUTH_SERVICE');

export interface TenantOption {
  id: string;
  name: string;
}

export interface LayoutTenantService {
  isAdmin: Signal<boolean>;
  tenantOptions: Signal<TenantOption[]>;
  selectedTenantId: Signal<string | null>;
  setSelectedTenantId(id: string | null): void;
}

export const LAYOUT_TENANT_SERVICE = new InjectionToken<LayoutTenantService>('LAYOUT_TENANT_SERVICE');
