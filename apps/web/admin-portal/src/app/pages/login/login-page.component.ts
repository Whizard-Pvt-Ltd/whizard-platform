import { Component, inject } from '@angular/core';
import { LoginPageComponent as SharedLoginPageComponent } from '@whizard/shared-ui';
import { AuthService } from '../../core/services/auth.service';

/**
 * Admin Portal Login Page
 *
 * This is a thin wrapper around the shared LoginPageComponent from @whizard/shared-ui.
 * It injects the admin portal's AuthService and passes it to the shared component.
 */
@Component({
  selector: 'admin-login-page',
  standalone: true,
  imports: [SharedLoginPageComponent],
  template: '<whizard-login-page [authService]="authService" />'
})
export class LoginPageComponent {
  protected readonly authService = inject(AuthService);
}
