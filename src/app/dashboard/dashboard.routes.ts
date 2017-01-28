import { Routes } from '@angular/router';

import { ReadingDashComponent, ProjectDashComponent } from '.';

export const DashboardRoutes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full'},
  { path: 'projects', component: ProjectDashComponent },
  { path: 'readings', component: ReadingDashComponent }
];