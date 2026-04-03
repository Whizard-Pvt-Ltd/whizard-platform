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
