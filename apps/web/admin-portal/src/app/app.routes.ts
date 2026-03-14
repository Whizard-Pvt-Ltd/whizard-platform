import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login-page.component';
import { SignupPageComponent } from './pages/signup/signup-page.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EnhancedProfilePageComponent } from './pages/profile/enhanced-profile-page.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
    title: 'Whizard Admin Login'
  },
  {
    path: 'signup',
    component: SignupPageComponent,
    title: 'Whizard Admin Signup'
  },
  {
    path: 'profile',
    component: EnhancedProfilePageComponent,
    title: 'Account Settings',
    canActivate: [authGuard]
  },
  {
    path: '',
    component: DashboardComponent,
    title: 'Whizard Dashboard',
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
