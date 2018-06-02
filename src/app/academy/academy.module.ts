import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AcademyRoutingModule } from './academy-routing.module';
import { EngagementComponent } from './engagement/engagement.component';
import { AppComponent } from '../app.component';
@NgModule({
  imports: [
    CommonModule,
    AcademyRoutingModule,
    AppComponent
  ],
  declarations: [EngagementComponent]
})
export class AcademyModule { }
