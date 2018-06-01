import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AcademyRoutingModule } from './academy-routing.module';
import { EngagementComponent } from './engagement/engagement.component';

@NgModule({
  imports: [
    CommonModule,
    AcademyRoutingModule
  ],
  declarations: [EngagementComponent]
})
export class AcademyModule { }
