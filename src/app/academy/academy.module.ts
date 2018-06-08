import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AcademyRoutingModule } from './academy-routing.module'
import { EngagementComponent } from './engagement/engagement.component'
import { SharedModule } from '../app-shared.module';
import { LicenseMgmtComponent } from './license-mgmt/license-mgmt.component'

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AcademyRoutingModule
  ],
  declarations: [EngagementComponent, LicenseMgmtComponent]
})
export class AcademyModule { }
