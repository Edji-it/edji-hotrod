import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Project Dependencies
import { EngagementComponent } from './engagement/engagement.component';
import { LicenseMgmtComponent } from './license-mgmt/license-mgmt.component';

const routes: Routes = [ {
  path: '',
  component: EngagementComponent
},{
  path: 'engagement',
  component: EngagementComponent
},{
  path: 'licenses',
  component: LicenseMgmtComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademyRoutingModule { }
