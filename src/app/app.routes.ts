import { Routes, RouterModule } from '@angular/router';

import { NewReadingPage } from './new-reading-page';
import { ProjectPageComponent } from './project-page';
import { HomeComponent } from './home';
import { RegisterComponent } from './register';
import { AccountComponent } from './account';
import { DashboardComponent } from './dashboard';
import { NoContentComponent } from './no-content';
import { LoginComponent } from './login';
import { ResetPassPage } from './reset-pass/reset-pass-page.component';
import { HeroCountdownComponent } from './hero-countdown/hero-countdown.component';

import { DataResolver } from './app.resolver';
import { AuthService } from './shared';

import { DashboardRoutes } from './dashboard/dashboard.routes';

export const ROUTES: Routes = [
  { path: '', redirectTo: '/dashboard/projects', pathMatch: 'full', canActivate: [AuthService] },
  { path: 'home',  component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'account', component: AccountComponent, canActivate: [AuthService] },
  { path: 'dashboard',  component: DashboardComponent, canActivate: [AuthService], children: DashboardRoutes },
  { path: 'project/:id',  component: ProjectPageComponent },
  { path: 'new-reading', component: NewReadingPage, canActivate: [AuthService] },
  { path: 'new-reading/:id', component: NewReadingPage, canActivate: [AuthService] },
  { path: 'reset-password', component: ResetPassPage },
  { path: 'hero-countdown',    component: HeroCountdownComponent, pathMatch: 'full' },
  { path: 'not-found',    component: NoContentComponent, pathMatch: 'full' },
  { path: ':projectId', redirectTo: '/project/:projectId', pathMatch: 'full'},
  { path: '**',    component: NoContentComponent }
];