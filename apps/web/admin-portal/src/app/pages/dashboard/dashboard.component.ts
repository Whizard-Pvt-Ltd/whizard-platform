import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TokenStorageService } from '../../core/services/token-storage.service';

@Component({
  selector: 'whizard-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  protected userEmail: string | null = null;
  protected tokenExpiry: string | null = null;

  ngOnInit(): void {
    // Decode JWT to get user info (simplified - in production use a JWT library)
    const token = this.tokenStorage.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userEmail = payload.sub || 'Unknown';
        const expiresAt = this.tokenStorage.getExpiresAt();
        if (expiresAt) {
          this.tokenExpiry = new Date(expiresAt).toLocaleString();
        }
      } catch (e) {
        if (typeof reportError === 'function') {
          reportError(e);
        }
      }
    }
  }

  protected logout(): void {
    this.authService.logout();
  }
}
