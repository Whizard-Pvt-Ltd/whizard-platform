import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StackAuthService } from '../../core/services/stack-auth.service';

/**
 * Enhanced Admin Portal Profile Page
 *
 * Displays comprehensive user profile information from Stack Auth including:
 * - User ID
 * - Primary Email
 * - Display Name
 * - Email Verification Status
 * - Sign-up Date
 * - Account Status
 */
@Component({
  selector: 'admin-enhanced-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './enhanced-profile-page.component.html',
  styleUrls: ['./enhanced-profile-page.component.css']
})
export class EnhancedProfilePageComponent implements OnInit {
  protected readonly stackAuthService = inject(StackAuthService);
  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly editedDisplayName = signal<string>('');

  protected readonly user = this.stackAuthService.currentUser;
  protected readonly createdAt = signal<string | null>(null);

  ngOnInit(): void {
    // Calculate account creation date from token if available
    const token = this.stackAuthService.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.iat) {
          this.createdAt.set(new Date(payload.iat * 1000).toLocaleString());
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }

  protected startEditing(): void {
    const currentUser = this.user();
    this.editedDisplayName.set(currentUser?.displayName || '');
    this.isEditing.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected cancelEditing(): void {
    this.isEditing.set(false);
    this.editedDisplayName.set('');
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected async saveProfile(): Promise<void> {
    const displayName = this.editedDisplayName().trim();

    if (!displayName || displayName.length < 2) {
      this.errorMessage.set('Display name must be at least 2 characters');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.stackAuthService.updateProfile({ displayName });
      this.successMessage.set('Profile updated successfully!');
      this.isEditing.set(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update profile. Please try again.';
      this.errorMessage.set(errorMessage);
    } finally {
      this.isSaving.set(false);
    }
  }

  protected async sendVerificationEmail(): Promise<void> {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.stackAuthService.sendEmailVerification();
      this.successMessage.set('Verification email sent! Please check your inbox.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to send verification email. Please try again.';
      this.errorMessage.set(errorMessage);
    }
  }
}
