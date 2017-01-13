import { Routes, RouterModule } from '@angular/router';

import { NewReadingPage } from './new-reading-page';
import { ProjectPageComponent } from './project-page';
import { ReadingPageComponent } from './reading-page';
import { HomeComponent } from './home';
import { RegisterComponent } from './register';
import { JoinComponent } from './join/join.component';
import { AccountComponent } from './account';
import { DashboardComponent } from './dashboard';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';
import { AuthService } from './shared';


export const ROUTES: Routes = [
  { path: '',      redirectTo: '/dashboard', pathMatch: 'full', canActivate: [AuthService] },
  { path: 'home',  component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'join/:projectId', component: JoinComponent },
  { path: 'account', component: AccountComponent, canActivate: [AuthService] },
  { path: 'dashboard',  component: DashboardComponent, canActivate: [AuthService] },
  { path: 'project/:id',  component: ProjectPageComponent, canActivate: [AuthService] },
  { path: 'reading/:id',  component: ReadingPageComponent, canActivate: [AuthService] },
  { path: 'new-reading', component: NewReadingPage, canActivate: [AuthService] },
  { path: '**',    component: NoContentComponent }
];
