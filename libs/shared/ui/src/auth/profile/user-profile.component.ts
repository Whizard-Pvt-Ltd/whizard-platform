
import { Component, Input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/**
 * User profile data from Stack Auth
 */
export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
  emailVerified: boolean;
}

/**
 * Interface for auth service that profile component depends on
 */
export interface IProfileAuthService {
  currentUser: () => UserProfile | null;
  updateProfile(updates: { displayName?: string; profileImageUrl?: string }): Promise<void>;
  sendEmailVerification?(): Promise<void>;
}

/**
 * Shared User Profile Component
 *
 * Displays and allows editing of user profile information from Stack Auth.
 *
 * Usage:
 * ```typescript
 * import { UserProfileComponent } from '@whizard/shared-ui';
 *
 * @Component({
 *   template: '<whizard-user-profile [authService]="stackAuthService" />'
 * })
 * export class ProfilePage {
 *   stackAuthService = inject(StackAuthService);
 * }
 * ```
 */
@Component({
  selector: 'whizard-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  @Input() authService?: IProfileAuthService;

  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly profileForm = new FormGroup({
    displayName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    email: new FormControl({ value: '', disabled: true }, { nonNullable: true })
  });

  ngOnInit(): void {
    this.loadUserProfile();
  }

  protected loadUserProfile(): void {
    if (!this.authService) {
      return;
    }

    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        displayName: user.displayName || '',
        email: user.email || ''
      });
    }
  }

  protected get user(): UserProfile | null {
    return this.authService?.currentUser() || null;
  }

  protected startEditing(): void {
    this.isEditing.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected cancelEditing(): void {
    this.isEditing.set(false);
    this.loadUserProfile(); // Reset form to original values
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected async saveProfile(): Promise<void> {
    if (this.profileForm.invalid || this.isSaving() || !this.authService) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const { displayName } = this.profileForm.getRawValue();

      await this.authService.updateProfile({
        displayName
      });

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
    if (!this.authService?.sendEmailVerification) {
      this.errorMessage.set('Email verification not available.');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.authService.sendEmailVerification();
      this.successMessage.set('Verification email sent! Please check your inbox.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to send verification email. Please try again.';
      this.errorMessage.set(errorMessage);
    }
  }
}
