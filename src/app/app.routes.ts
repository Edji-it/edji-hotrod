import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home';
import { DashboardComponent } from './dashboard';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';


export const ROUTES: Routes = [
  { path: '',      component: HomeComponent },
  { path: 'home',  component: HomeComponent },
  { path: 'dashboard',  component: DashboardComponent },
  { path: '**',    component: NoContentComponent },
];
