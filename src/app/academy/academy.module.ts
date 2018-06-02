import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AcademyRoutingModule } from './academy-routing.module'
import { EngagementComponent } from './engagement/engagement.component'
import { SharedModule } from '../app-shared.module'

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AcademyRoutingModule
  ],
  declarations: [EngagementComponent]
})
export class AcademyModule { }
