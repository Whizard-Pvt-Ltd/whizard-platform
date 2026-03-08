import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

export interface LoginRequest {
  loginId: string;
  password: string;
  clientContext: string;
}

export interface LoginResponse {
  userAccountId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  authenticationMode: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  private readonly BFF_BASE_URL = 'http://localhost:3000';

  login(email: string, password: string): Observable<ApiEnvelope<LoginResponse>> {
    const loginRequest: LoginRequest = {
      loginId: email,
      password: password,
      clientContext: 'web-admin-portal'
    };

    return this.http.post<ApiEnvelope<LoginResponse>>(
      `${this.BFF_BASE_URL}/iam/auth/login`,
      loginRequest
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenStorage.saveTokens({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            expiresAt: response.data.expiresAt
          });
        }
      })
    );
  }

  logout(): void {
    this.tokenStorage.clearTokens();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.isAuthenticated();
  }

  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }
}
