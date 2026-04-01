
import { Component, Input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/**
 * Interface for auth service that password change component depends on
 */
export interface IPasswordAuthService {
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
}

/**
 * Shared Change Password Component
 *
 * Allows users to change their password.
 *
 * Usage:
 * ```typescript
 * import { ChangePasswordComponent } from '@whizard/shared-ui';
 *
 * @Component({
 *   template: '<whizard-change-password [authService]="stackAuthService" />'
 * })
 * export class PasswordPage {
 *   stackAuthService = inject(StackAuthService);
 * }
 * ```
 */
@Component({
  selector: 'whizard-change-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  @Input() authService?: IPasswordAuthService;

  protected readonly isSubmitting = signal(false);
  protected readonly showOldPassword = signal(false);
  protected readonly showNewPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly passwordForm = new FormGroup({
    oldPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)]
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  protected toggleOldPasswordVisibility(): void {
    this.showOldPassword.update((value) => !value);
  }

  protected toggleNewPasswordVisibility(): void {
    this.showNewPassword.update((value) => !value);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  protected async submit(): Promise<void> {
    if (this.passwordForm.invalid || this.isSubmitting()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (!this.authService) {
      this.errorMessage.set('Password change service not configured. Please contact support.');
      return;
    }

    const { oldPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();

    // Validate password match
    if (newPassword !== confirmPassword) {
      this.errorMessage.set('New passwords do not match.');
      return;
    }

    // Validate new password is different from old
    if (oldPassword === newPassword) {
      this.errorMessage.set('New password must be different from old password.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.authService.changePassword(oldPassword, newPassword);

      this.successMessage.set('Password changed successfully!');
      this.passwordForm.reset();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to change password. Please check your old password and try again.';
      this.errorMessage.set(errorMessage);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
