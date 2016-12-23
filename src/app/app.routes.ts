import { Routes, RouterModule } from '@angular/router';

import { NewReadingPage } from './new-reading-page';
import { ProjectPageComponent } from './project-page';
import { ReadingPageComponent } from './reading-page';
import { HomeComponent } from './home';
import { AccountComponent } from './account';
import { DashboardComponent } from './dashboard';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';


export const ROUTES: Routes = [
  { path: '',      redirectTo: '/home', pathMatch: 'full' },
  { path: 'home',  component: HomeComponent },
  { path: 'account', component: AccountComponent },
  { path: 'dashboard',  component: DashboardComponent },
  { path: 'project/:id',  component: ProjectPageComponent },
  { path: 'reading/:id',  component: ReadingPageComponent },
  { path: 'new-reading', component: NewReadingPage },
  { path: '**',    component: NoContentComponent }
];
