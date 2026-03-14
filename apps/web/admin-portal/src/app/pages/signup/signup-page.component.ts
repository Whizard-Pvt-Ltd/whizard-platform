import { Component, inject, OnInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { SignupPageComponent as SharedSignupPageComponent } from '@whizard/shared-ui';
import { StackAuthService } from '../../core/services/stack-auth.service';

/**
 * Admin Portal Signup Page
 *
 * This is a thin wrapper around the shared SignupPageComponent from @whizard/shared-ui.
 * It injects the admin portal's StackAuthService and passes it to the shared component.
 *
 * If the user is already authenticated, they will be redirected to the dashboard.
 */
@Component({
  selector: 'admin-signup-page',
  standalone: true,
  imports: [SharedSignupPageComponent],
  template: '<whizard-signup-page [authService]="stackAuthService" />'
})
export class SignupPageComponent implements OnInit {
  protected readonly stackAuthService = inject(StackAuthService);
  private readonly router = inject(Router);

  constructor() {
    // Redirect to dashboard if already authenticated
    effect(() => {
      if (this.stackAuthService.isAuthenticated() && !this.stackAuthService.isLoading()) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnInit(): void {
    // Check authentication status on component init
    if (this.stackAuthService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
}
