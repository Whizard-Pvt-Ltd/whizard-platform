import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, from } from 'rxjs';

/**
 * Response from authentication login request
 */
export interface AuthLoginResponse {
  success: boolean;
  message?: string;
}

/**
 * Interface for authentication service that login component depends on.
 * Consumer applications must provide an implementation of this interface.
 *
 * Supports both Observable-based (legacy) and Promise-based (Stack Auth) auth services.
 */
export interface IAuthService {
  login(email: string, password: string): Observable<AuthLoginResponse> | Promise<void>;
  signIn?(email: string, password: string): Promise<void>;
}

/**
 * Shared Login Page Component
 *
 * This component can be used across multiple web portals (admin, user, partner, etc.)
 *
 * Usage Option 1 - Provide AuthService via Input:
 * ```typescript
 * // In your wrapper component
 * import { LoginPageComponent } from '@whizard/shared-ui';
 *
 * @Component({
 *   template: '<whizard-login-page [authService]="authService" />'
 * })
 * export class LoginPage {
 *   authService = inject(AuthService);
 * }
 * ```
 *
 * Usage Option 2 - Import the component directly (if AuthService has proper shape):
 * ```typescript
 * import { LoginPageComponent } from '@whizard/shared-ui';
 * export const routes: Routes = [
 *   { path: 'login', component: LoginPageComponent, title: 'Login' }
 * ];
 * ```
 */
@Component({
  selector: 'whizard-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly router = inject(Router);

  /**
   * Auth service can be provided via Input by the consuming application.
   * This allows different portals to use their own authentication logic.
   */
  @Input() authService?: IAuthService;

  protected readonly isSubmitting = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)]
    }),
    rememberMe: new FormControl(true, { nonNullable: true })
  });

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  protected async submit(): Promise<void> {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (!this.authService) {
      this.errorMessage.set('Authentication service not configured. Please contact support.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();

    try {
      // Check if this is a Stack Auth service (has signIn method) or legacy service
      if (this.authService.signIn) {
        // Stack Auth service - uses Promise-based signIn
        await this.authService.signIn(email, password);
        this.isSubmitting.set(false);
        // Stack Auth service handles navigation internally
      } else {
        // Legacy Observable-based auth service
        const loginResult = this.authService.login(email, password);

        // Handle both Promise and Observable
        if (loginResult instanceof Promise) {
          // Convert Promise to Observable
          from(loginResult).subscribe({
            next: () => {
              this.isSubmitting.set(false);
              this.router.navigate(['/']);
            },
            error: (error: Error & { error?: { message?: string } }) => {
              this.isSubmitting.set(false);
              if (typeof reportError === 'function') {
                reportError(error);
              }
              this.errorMessage.set(
                error.error?.message || 'Login failed. Please check your credentials and try again.'
              );
            }
          });
        } else {
          // It's an Observable
          (loginResult as Observable<AuthLoginResponse>).subscribe({
            next: (response: AuthLoginResponse) => {
              this.isSubmitting.set(false);
              if (response?.success !== false) {
                this.router.navigate(['/']);
              } else {
                this.errorMessage.set('Login failed. Please try again.');
              }
            },
            error: (error: Error & { error?: { message?: string } }) => {
              this.isSubmitting.set(false);
              if (typeof reportError === 'function') {
                reportError(error);
              }
              this.errorMessage.set(
                error.error?.message || 'Login failed. Please check your credentials and try again.'
              );
            }
          });
        }
      }
    } catch (error: unknown) {
      this.isSubmitting.set(false);
      if (typeof reportError === 'function') {
        reportError(error);
      }
      const errorMessage = error instanceof Error
        ? error.message
        : 'Login failed. Please check your credentials and try again.';
      this.errorMessage.set(errorMessage);
    }
  }
}
