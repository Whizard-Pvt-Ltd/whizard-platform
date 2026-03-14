/**
 * Authentication UI Components
 *
 * Shared authentication components that can be used across all Whizard portals
 * (admin-portal, user-portal, partner-portal, etc.)
 */

export { LoginPageComponent, type IAuthService } from './login/login-page.component.js';
export { SignupPageComponent } from './signup/signup-page.component.js';
export { UserProfileComponent, type IProfileAuthService, type UserProfile } from './profile/user-profile.component.js';
export { ChangePasswordComponent, type IPasswordAuthService } from './password/change-password.component.js';
