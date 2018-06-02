import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EngagementComponent } from './engagement/engagement.component';

const routes: Routes = [ {
  path: '',
  component: EngagementComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademyRoutingModule { }
