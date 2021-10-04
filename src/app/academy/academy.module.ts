import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AcademyRoutingModule } from './academy-routing.module'
import { EngagementComponent } from './engagement/engagement.component'
import { SharedModule } from '../app-shared.module'
import { LicenseMgmtComponent } from './license-mgmt/license-mgmt.component'
import { LicenseRemoveUserComponent } from './license-mgmt/remove-user/remove-user.component'

@NgModule({
  imports: [CommonModule, SharedModule, AcademyRoutingModule],
  declarations: [EngagementComponent, LicenseMgmtComponent, LicenseRemoveUserComponent],
})
export class AcademyModule {}
