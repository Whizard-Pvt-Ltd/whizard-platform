import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { IndustryWrcfComponent } from './pages/industry-wrcf/industry-wrcf.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { EnhancedProfilePageComponent } from './pages/profile/enhanced-profile-page.component';
import { SignupPageComponent } from './pages/signup/signup-page.component';
import { WrcfDashboardComponent } from './pages/wrcf-dashboard/wrcf-dashboard.component';
import { WrcfRolesComponent } from './pages/wrcf-roles/wrcf-roles.component';
import { WrcfSkillsComponent } from './pages/wrcf-skills/wrcf-skills.component';

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
    path: 'dashboard',
    component: WrcfDashboardComponent,
    title: 'Industry WRCF Dashboard',
    canActivate: [authGuard]
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
    path: 'wrcf-skills',
    component: WrcfSkillsComponent,
    title: 'Manage WRCF Skills',
    canActivate: [authGuard]
  },
  {
    path: 'wrcf-roles',
    component: WrcfRolesComponent,
    title: 'Manage WRCF Roles',
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
