import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login-page.component';
import { SignupPageComponent } from './pages/signup/signup-page.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EnhancedProfilePageComponent } from './pages/profile/enhanced-profile-page.component';
import { IndustryWrcfComponent } from './pages/industry-wrcf/industry-wrcf.component';
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
    path: 'industry-wrcf',
    component: IndustryWrcfComponent,
    title: 'Manage Industry WRCF',
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'industry-wrcf',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
