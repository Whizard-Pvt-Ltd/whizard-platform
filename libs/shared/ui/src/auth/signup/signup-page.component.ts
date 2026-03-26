
import { Component, Input, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, from } from 'rxjs';

/**
 * Response from authentication signup request
 */
export interface AuthSignupResponse {
  success: boolean;
  message?: string;
}

/**
 * Interface for authentication service that signup component depends on.
 * Consumer applications must provide an implementation of this interface.
 *
 * Supports both Observable-based (legacy) and Promise-based (Stack Auth) auth services.
 */
export interface IAuthService {
  signup?(email: string, password: string, displayName?: string): Observable<AuthSignupResponse> | Promise<void>;
  signUp?(email: string, password: string, displayName?: string): Promise<void>;
}

/**
 * Shared Signup Page Component
 *
 * This component can be used across multiple web portals (admin, user, partner, etc.)
 *
 * Usage:
 * ```typescript
 * import { SignupPageComponent } from '@whizard/shared-ui';
 *
 * @Component({
 *   template: '<whizard-signup-page [authService]="authService" />'
 * })
 * export class SignupPage {
 *   authService = inject(StackAuthService);
 * }
 * ```
 */
@Component({
  selector: 'whizard-signup-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent {
  private readonly router = inject(Router);

  /**
   * Auth service can be provided via Input by the consuming application.
   * This allows different portals to use their own authentication logic.
   */
  @Input() authService?: IAuthService;

  protected readonly isSubmitting = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly signupForm = new FormGroup({
    displayName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)]
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    agreeToTerms: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] })
  });

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  get passwordStrength(): number {
    const v = this.signupForm.controls.password.value;
    let s = 0;
    if (v.length >= 8) s++;
    if (v.length >= 12) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return Math.min(s, 4);
  }

  get strengthLabel(): string {
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.passwordStrength];
  }

  get passwordsMatch(): boolean {
    const { password, confirmPassword } = this.signupForm.controls;
    return password.value.length > 0 && password.value === confirmPassword.value;
  }

  protected async submit(): Promise<void> {
    if (this.signupForm.invalid || this.isSubmitting()) {
      this.signupForm.markAllAsTouched();
      return;
    }

    if (!this.authService) {
      this.errorMessage.set('Authentication service not configured. Please contact support.');
      return;
    }

    const { email, password, confirmPassword, displayName } = this.signupForm.getRawValue();

    // Validate password match
    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      // Check if this is a Stack Auth service (has signUp method) or legacy service
      if (this.authService.signUp) {
        // Stack Auth service - uses Promise-based signUp
        await this.authService.signUp(email, password, displayName);
        this.isSubmitting.set(false);
        // Stack Auth service handles navigation internally
      } else if (this.authService.signup) {
        // Legacy Observable-based auth service
        const signupResult = this.authService.signup(email, password, displayName);

        // Handle both Promise and Observable
        if (signupResult instanceof Promise) {
          // Convert Promise to Observable
          from(signupResult).subscribe({
            next: () => {
              this.isSubmitting.set(false);
              this.successMessage.set('Account created successfully! Redirecting...');
              setTimeout(() => this.router.navigate(['/login']), 2000);
            },
            error: (error: Error & { error?: { message?: string } }) => {
              this.isSubmitting.set(false);
              if (typeof reportError === 'function') {
                reportError(error);
              }
              this.errorMessage.set(
                error.error?.message || 'Signup failed. Please try again.'
              );
            }
          });
        } else {
          // It's an Observable
          (signupResult as Observable<AuthSignupResponse>).subscribe({
            next: (response: AuthSignupResponse) => {
              this.isSubmitting.set(false);
              if (response?.success !== false) {
                this.successMessage.set('Account created successfully! Redirecting...');
                setTimeout(() => this.router.navigate(['/login']), 2000);
              } else {
                this.errorMessage.set(response?.message || 'Signup failed. Please try again.');
              }
            },
            error: (error: Error & { error?: { message?: string } }) => {
              this.isSubmitting.set(false);
              if (typeof reportError === 'function') {
                reportError(error);
              }
              this.errorMessage.set(
                error.error?.message || 'Signup failed. Please try again.'
              );
            }
          });
        }
      } else {
        this.errorMessage.set('Signup is not supported by the authentication service.');
        this.isSubmitting.set(false);
      }
    } catch (error: unknown) {
      this.isSubmitting.set(false);
      if (typeof reportError === 'function') {
        reportError(error);
      }
      const errorMessage = error instanceof Error
        ? error.message
        : 'Signup failed. Please try again.';
      this.errorMessage.set(errorMessage);
    }
  }
}
