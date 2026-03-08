import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login-page.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
    title: 'Whizard Admin Login'
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
