import { Routes } from '@angular/router';

import { CreatedDashComponent, JoinedDashComponent } from '.';

export const DashboardRoutes: Routes = [
  { path: '', redirectTo: 'readings', pathMatch: 'full'},
  { path: 'projects', redirectTo: '' },
  { path: 'readings', redirectTo: '' }
];