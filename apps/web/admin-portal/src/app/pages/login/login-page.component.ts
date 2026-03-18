import { Component, inject, OnInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { LoginPageComponent as SharedLoginPageComponent } from '@whizard/shared-ui';
import { StackAuthService } from '../../core/services/stack-auth.service';

/**
 * Admin Portal Login Page
 *
 * This is a thin wrapper around the shared LoginPageComponent from @whizard/shared-ui.
 * It injects the admin portal's StackAuthService and passes it to the shared component.
 *
 * If the user is already authenticated, they will be redirected to the dashboard.
 */
@Component({
  selector: 'admin-login-page',
  standalone: true,
  imports: [SharedLoginPageComponent],
  template: '<whizard-login-page [authService]="stackAuthService" />'
})
export class LoginPageComponent implements OnInit {
  protected readonly stackAuthService = inject(StackAuthService);
  private readonly router = inject(Router);

  constructor() {
    // Redirect to dashboard if already authenticated
    effect(() => {
      if (this.stackAuthService.isAuthenticated() && !this.stackAuthService.isLoading()) {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnInit(): void {
    // Check authentication status on component init
    if (this.stackAuthService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }
}
