/**
 * Stack Auth Service (Headless Mode)
 *
 * Angular service for authentication using Stack Auth SDK in headless mode.
 * This provides authentication logic without using Stack Auth's pre-built UI components.
 *
 * Architecture:
 * - Uses @stackframe/stack SDK for authentication
 * - Passwords sent directly to Stack Auth API (HTTPS) - never through BFF/Core-API
 * - JWT tokens stored in localStorage
 * - Tokens sent to BFF/Core-API in Authorization header for API requests
 *
 * Key Features:
 * - Email/password authentication
 * - User session management
 * - Token storage and retrieval
 * - User profile access
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
// import { environment } from '../../../environments/environment';
import { environment } from '../../../environments/environment';

export interface StackAuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
  emailVerified: boolean;
}

export interface StackAuthConfig {
  projectId: string;
  publishableClientKey: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    userAccountId: string;
    email: string;
  };
  error?: {
    message: string;
  };
}

export interface SignUpResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class StackAuthService {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  // Stack Auth API base URL
  private readonly stackAuthApiUrl = 'https://api.stack-auth.com';
  private projectId: string = '';
  private publishableKey: string = '';

  // Reactive signals for auth state
  private readonly currentUserSignal = signal<StackAuthUser | null>(null);
  private readonly loadingSignal = signal<boolean>(true);

  // Public observables
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  /**
   * Initialize Stack Auth SDK
   * Call this during app initialization (e.g., in app.config.ts or main.ts)
   */
  async initialize(config: StackAuthConfig): Promise<void> {
    try {
      this.loadingSignal.set(true);

      // Check if we have a valid publishable key
      if (!config.publishableClientKey || config.publishableClientKey === 'pk_test_xxxxx') {
        console.warn('Stack Auth not configured: Missing valid publishable client key. Please update environment.ts with your Stack Auth credentials.');
        this.currentUserSignal.set(null);
        this.loadingSignal.set(false);
        return;
      }

      // Store configuration
      this.projectId = config.projectId;
      this.publishableKey = config.publishableClientKey;

      // Check for existing session from stored tokens
      await this.checkSession();
    } catch (error) {
      console.error('Failed to initialize Stack Auth:', error);
      this.currentUserSignal.set(null);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Check if user has an active session
   * Note: We rely on the JWT token and user data set during sign-in/sign-up.
   * Stack Auth's /users/me endpoint requires server-side access and doesn't work with client tokens.
   */
  private async checkSession(): Promise<void> {
    const accessToken = this.tokenStorage.getAccessToken();

    if (!accessToken) {
      this.currentUserSignal.set(null);
      return;
    }

    // Decode JWT to get user info
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));

      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('Access token expired');
        this.tokenStorage.clearTokens();
        this.currentUserSignal.set(null);
        return;
      }

      // Set basic info from token + stored email
      if (!this.currentUserSignal()) {
        const storedEmail = this.tokenStorage.getUserEmail();
        this.currentUserSignal.set({
          id: payload.user_id || payload.sub,
          email: storedEmail,
          displayName: null,
          profileImageUrl: null,
          emailVerified: false
        });
      }
    } catch (error) {
      console.error('Failed to check session:', error);
      // Token might be invalid, clear it
      this.tokenStorage.clearTokens();
      this.currentUserSignal.set(null);
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<void> {
    this.loadingSignal.set(true);

    try {
      // Sign in via BFF (which calls Core API → Stack Auth)
      console.log('Signing in via BFF...', { email });

      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${environment.bffApiUrl}/iam/auth/login`, {
          email,
          password
        }, {
          withCredentials: true
        })
      );

      console.log('Sign in response:', response);

      // Check for success
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Login failed');
      }

      const { data } = response;

      // Store tokens
      if (data.accessToken && data.refreshToken) {
        this.tokenStorage.saveTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt || this.calculateExpiresAt(data.accessToken),
          email: data.email || email
        });
      }

      // Set user from sign-in response
      if (data.userAccountId) {
        this.currentUserSignal.set({
          id: data.userAccountId,
          email: data.email || email,
          displayName: null,
          profileImageUrl: null,
          emailVerified: false
        });
      }

      await this.router.navigate(['/']);
    } catch (error: unknown) {
      console.error('Sign in failed:', error);
      if (error && typeof error === 'object' && 'error' in error) {
        console.error('Full error object:', JSON.stringify((error as { error: unknown }).error, null, 2));
        console.error('Error details:', {
          status: 'status' in error ? (error as { status: unknown }).status : undefined,
          statusText: 'statusText' in error ? (error as { statusText: unknown }).statusText : undefined,
          message: (error as { error?: { message?: string } }).error?.message || (error instanceof Error ? error.message : 'Unknown error'),
          errorCode: (error as { error?: { code?: string } }).error?.code,
          errorDetails: (error as { error?: { details?: unknown } }).error?.details,
          fullError: (error as { error?: unknown }).error
        });
      }
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, displayName?: string): Promise<void> {
    if (!this.projectId) {
      throw new Error('Stack Auth not initialized');
    }

    this.loadingSignal.set(true);

    try {
      // Sign up using Stack Auth REST API
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-stack-publishable-client-key': this.publishableKey,
        'x-stack-project-id': this.projectId,
        'x-stack-access-type': 'client'
      });

      const response = await firstValueFrom(
        this.http.post<SignUpResponse>(`${this.stackAuthApiUrl}/api/v1/auth/password/sign-up`, {
          email,
          password
        }, { headers })
      );

      // Store tokens
      if (response.access_token && response.refresh_token) {
        this.tokenStorage.saveTokens({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          expiresAt: this.calculateExpiresAt(response.access_token)
        });
      }

      // Set user from sign-up response
      if (response.user_id) {
        this.currentUserSignal.set({
          id: response.user_id,
          email: email,
          displayName: null,
          profileImageUrl: null,
          emailVerified: false
        });
      }

      await this.router.navigate(['/']);
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      this.tokenStorage.clearTokens();
      this.currentUserSignal.set(null);
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  /**
   * Get current access token for API requests
   */
  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  /**
   * Fetch the current user profile from the BFF and update the signal
   */
  async refreshUserProfile(): Promise<void> {
    const accessToken = this.tokenStorage.getAccessToken();
    if (!accessToken) return;

    try {
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${accessToken}` });

      const response = await firstValueFrom(
        this.http.get<{ success: boolean; data: { userAccountId: string; email: string } }>(
          `${environment.bffApiUrl}/iam/me`,
          { headers }
        )
      );

      if (response.success && response.data) {
        const current = this.currentUserSignal();
        this.currentUserSignal.set({
          id: response.data.userAccountId ?? current?.id ?? '',
          email: response.data.email || current?.email || null,
          displayName: current?.displayName ?? null,
          profileImageUrl: current?.profileImageUrl ?? null,
          emailVerified: current?.emailVerified ?? false
        });
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const accessToken = this.tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new Error('No user signed in');
    }

    try {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'x-stack-publishable-client-key': this.publishableKey,
        'x-stack-project-id': this.projectId,
        'x-stack-access-type': 'client'
      });

      await firstValueFrom(
        this.http.post(`${this.stackAuthApiUrl}/api/v1/auth/password/update`, {
          old_password: oldPassword,
          new_password: newPassword
        }, { headers })
      );
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: { displayName?: string; profileImageUrl?: string }): Promise<void> {
    const accessToken = this.tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new Error('No user signed in');
    }

    try {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'x-stack-publishable-client-key': this.publishableKey,
        'x-stack-project-id': this.projectId,
        'x-stack-access-type': 'client'
      });

      await firstValueFrom(
        this.http.patch(`${this.stackAuthApiUrl}/api/v1/users/me`, {
          display_name: updates.displayName,
          profile_image_url: updates.profileImageUrl
        }, { headers })
      );

      // Update local user state
      const currentUser = this.currentUserSignal();
      if (currentUser) {
        this.currentUserSignal.set({
          ...currentUser,
          displayName: updates.displayName ?? currentUser.displayName,
          profileImageUrl: updates.profileImageUrl ?? currentUser.profileImageUrl
        });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<void> {
    const accessToken = this.tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new Error('No user signed in');
    }

    try {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'x-stack-publishable-client-key': this.publishableKey,
        'x-stack-project-id': this.projectId,
        'x-stack-access-type': 'client'
      });

      await firstValueFrom(
        this.http.post(`${this.stackAuthApiUrl}/api/v1/users/me/emails/send-verification`, {}, { headers })
      );
    } catch (error) {
      console.error('Failed to send email verification:', error);
      throw error;
    }
  }

  /**
   * Calculate token expiration time from JWT
   */
  private calculateExpiresAt(accessToken: string): string {
    try {
      // Decode JWT to get expiration
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.exp) {
        return new Date(payload.exp * 1000).toISOString();
      }
    } catch (error) {
      console.error('Failed to decode JWT:', error);
    }

    // Fallback: assume 30 minutes
    return new Date(Date.now() + 30 * 60 * 1000).toISOString();
  }
}
