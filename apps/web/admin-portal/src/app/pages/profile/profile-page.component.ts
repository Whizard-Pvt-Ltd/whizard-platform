import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserProfileComponent } from '@whizard/shared-ui';
import { StackAuthService } from '../../core/services/stack-auth.service';

/**
 * Admin Portal Profile Page
 *
 * Uses the shared UserProfileComponent which integrates with Stack Auth REST API.
 * This provides a seamless in-app profile management experience.
 *
 * Note: Stack Auth's React components are not compatible with Angular.
 * We use our custom implementation that calls Stack Auth REST API endpoints.
 */
@Component({
  selector: 'admin-profile-page',
  standalone: true,
  imports: [UserProfileComponent, CommonModule],
  template: '<whizard-user-profile [authService]="stackAuthService" />'
})
export class ProfilePageComponent {
  protected readonly stackAuthService = inject(StackAuthService);
}
