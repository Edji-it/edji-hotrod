/**
 * Shared Module
 * - Used to import/export components shared globally
 * - Only add components when they are *needed* globally
 */
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgScrollbarModule } from 'ngx-scrollbar'

// Project Dependencies
import {
  NavBarComponent,
  FooterComponent,
  FollowTag,
  FeedbackComponent,
  MessageToastsComponent,
  ShareLinkComponent,
  UserAvatarComponent,
  UserAvatarEditorComponent,
} from './shared'
// Pipes
import {
  AddClassPipe,
  EdjiDatePipe,
  EmojiOnePipe,
  LinkifyPipe,
  SortByDatePipe,
  SubjectPipe,
  UserInitialsPipe,
} from './_pipes'
// Directives
import { ClickOutsideDirective } from './_directives/click-outside.directive'
// ShareCodeComponent has to be imported here due to its living in the nav bar
import {
  ReferralModalComponent,
  HeroSubscribeComponent,
  RequestAcademyModal,
  LicenseInviteComponent,
  ShareCodeComponent,
} from './modals'
import { GoogleClassroomShareButton, CopyLinkShareButton, CopyEmbedButton } from './buttons'
import { HotChartHzbarComponent } from './shared/hot-chart-hzbar/hot-chart-hzbar.component'
import { HotChartGaugeComponent } from './shared/hot-chart-gauge/hot-chart-gauge.component'
import { ShareSocialIconsComponent } from './shared/share-social-icons/share-social-icons.component'
import { QuickStartFlagComponent } from './shared/quick-start-flag.component'

let SHARED_DECLARATIONS = [
  AddClassPipe,
  ClickOutsideDirective,
  EdjiDatePipe,
  EmojiOnePipe,
  FeedbackComponent,
  FollowTag,
  FooterComponent,
  GoogleClassroomShareButton,
  CopyLinkShareButton,
  CopyEmbedButton,
  HeroSubscribeComponent,
  LicenseInviteComponent,
  LinkifyPipe,
  MessageToastsComponent,
  NavBarComponent,
  ReferralModalComponent,
  RequestAcademyModal,
  ShareCodeComponent,
  ShareLinkComponent,
  ShareSocialIconsComponent,
  SortByDatePipe,
  SubjectPipe,
  UserAvatarComponent,
  UserAvatarEditorComponent,
  UserInitialsPipe,
  HotChartHzbarComponent,
  HotChartGaugeComponent,
  QuickStartFlagComponent,
]

let SHARED_IMPORTS = [CommonModule, FormsModule, ReactiveFormsModule, NgScrollbarModule]

@NgModule({
  imports: [
    SHARED_IMPORTS,
    // Routes have to be privately imported for every module
    // RouterModule.forChild(ROUTES)
    RouterModule,
  ],
  /**
   * Declarations are private to AppShared
   * - SharedModule shouldn't need any private components
   */
  declarations: [SHARED_DECLARATIONS],
  /**
   * Exports are made available to children modules
   * (essentially PUBLIC DECLARATIONS)
   */
  exports: [SHARED_DECLARATIONS, SHARED_IMPORTS],
  providers: [EmojiOnePipe],
})
export class SharedModule {}
