import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * Interface for authentication service that login component depends on.
 * Consumer applications must provide an implementation of this interface.
 */
export interface IAuthService {
  login(email: string, password: string): any;
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
  imports: [CommonModule, ReactiveFormsModule],
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

  protected submit(): void {
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

    this.authService.login(email, password).subscribe({
      next: (response: any) => {
        this.isSubmitting.set(false);
        if (response.success) {
          // Navigate to dashboard or home page
          this.router.navigate(['/']);
        } else {
          this.errorMessage.set('Login failed. Please try again.');
        }
      },
      error: (error: any) => {
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
