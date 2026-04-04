import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '@whizard/shared-ui';
import { authGuard } from './core/guards/auth.guard';
import { IndustryWrcfComponent } from './pages/industry-wrcf/industry-wrcf.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { ManageCollegeComponent } from './pages/manage-college/manage-college.component';
import { ManageCompanyComponent } from './pages/manage-company/manage-company.component';
import { EnhancedProfilePageComponent } from './pages/profile/enhanced-profile-page.component';
import { SignupPageComponent } from './pages/signup/signup-page.component';
import { WrcfDashboardComponent } from './pages/wrcf-dashboard/wrcf-dashboard.component';
import { WrcfRolesComponent } from './pages/wrcf-roles/wrcf-roles.component';
import { WrcfSkillsComponent } from './pages/wrcf-skills/wrcf-skills.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
    title: 'Whizard Admin Login',
  },
  {
    path: 'signup',
    component: SignupPageComponent,
    title: 'Whizard Admin Signup',
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: WrcfDashboardComponent,
        title: 'Industry WRCF Dashboard',
      },
      {
        path: 'profile',
        component: EnhancedProfilePageComponent,
        title: 'Account Settings',
      },
      {
        path: 'industry-wrcf',
        component: IndustryWrcfComponent,
        title: 'Manage Industry WRCF',
      },
      {
        path: 'wrcf-skills',
        component: WrcfSkillsComponent,
        title: 'Manage WRCF Skills',
      },
      {
        path: 'wrcf-roles',
        component: WrcfRolesComponent,
        title: 'Manage WRCF Roles',
      },
      {
        path: 'manage-college',
        component: ManageCollegeComponent,
        title: 'Manage College',
      },
      {
        path: 'manage-company',
        component: ManageCompanyComponent,
        title: 'Manage Company',
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
