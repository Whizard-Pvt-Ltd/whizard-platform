import { Injectable } from '@angular/core';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly ACCESS_TOKEN_KEY = 'whizard_access_token';
  private readonly REFRESH_TOKEN_KEY = 'whizard_refresh_token';
  private readonly EXPIRES_AT_KEY = 'whizard_token_expires_at';
  private readonly USER_EMAIL_KEY = 'whizard_user_email';

  saveTokens(tokens: TokenPair): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, tokens.expiresAt);
    if (tokens.email) {
      localStorage.setItem(this.USER_EMAIL_KEY, tokens.email);
    }
  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.USER_EMAIL_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getExpiresAt(): string | null {
    return localStorage.getItem(this.EXPIRES_AT_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
    localStorage.removeItem(this.USER_EMAIL_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const expiresAt = this.getExpiresAt();

    if (!token || !expiresAt) {
      return false;
    }

    // Check if token is expired
    const expirationTime = new Date(expiresAt).getTime();
    const now = new Date().getTime();

    return now < expirationTime;
  }
}
