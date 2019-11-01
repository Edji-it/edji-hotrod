import { NgModule, ApplicationRef, ErrorHandler, Injectable } from '@angular/core'
import { HttpClientModule } from '@angular/common/http'
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser'
import { LockerModule, Locker, LockerConfig } from 'angular-safeguard'
import { Angulartics2Module } from 'angulartics2'
import * as Sentry from '@sentry/browser'
import { StoreModule } from '@ngrx/store'
import { reducers, metaReducers } from './_reducers'
import { EffectsModule } from '@ngrx/effects'

// App is our top level component
import { AppComponent } from './app.component'
// Shared Module imports components between modules
import { SharedModule } from './app-shared.module'

import { NgxPageScrollModule } from 'ngx-page-scroll'

// Sentry Setup
const appVersion = require('../../package.json').version
Sentry.init({
  dsn: 'https://f71b0ea0db5a4785b8ebee0b426b4bec@sentry.io/229527',
  release: appVersion,
})

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error) {
    // Post error to Sentry
    Sentry.captureException(error.originalError || error)
    // Continue to log error to browser
    console.error(error)
    // Continue throwing error
    throw error
  }
}

// Services
import {
  AuthService,
  BumblebeeService,
  CommentService,
  MediaService,
  MessageService,
  ProjectService,
  ReadingService,
  SocketService,
  UtilToolService,
  DashboardGuardService,
  MailchimpService,
  StateService,
} from './_services'
// import { ReuseStrategy } from './route-reuse-strategy'

// Store Services
import { ProjectStore, ProjectListStore } from './_store'

// Directives
import { MediumEditorModule } from 'angular2-medium-editor'
import { MultiselectDropdownModule } from './_directives'
import { ClickOutsideDirective } from './_directives/click-outside.directive'

// Components
import {
  OauthRowComponent,
  OpenEndedAnswersComponent,
  QuestionComponent,
  ScrollProgressComponent,
  TutorialBoxComponent,
  ResetComponent,
  PromoBannerComponent,
  SchoolSelectorComponent,
} from './shared'
import { HomeComponent, BadgeRowComponent, TweetCarouselComponent } from './home'
import { RegisterPageComponent, CreateProfilePageComponent } from './register-page'
import { LoginForm, GuestForm, RegisterFormComponent, ProfileFormComponent } from './forms'

import {
  LoginModal,
  UserDetailsUpdateModal,
  ResetPassComponent,
  DeleteCommentModal,
  DeleteReadingModal,
  DeleteProjectModal,
  AddProjectModal,
  LoginRequiredModal,
  HeroChangeComponent,
  LoginRegisterModal,
  DiscoverAddMetaModal,
  ReadingArchivedModal,
  ConfirmArchiveModal,
  ConfirmCoOwnerModal,
  ReadingPreviewModal,
  ReadingLinkModal,
  TutorialGifModalComponent,
} from './modals'
import {
  AnnotatorComponent,
  CommentComponent,
  TextCommentComponent,
  EmojiCommentComponent,
  EmojiKeyboardComponent,
  AudioCommentComponent,
  AvatarPortalComponent,
} from './annotator'
import { ProjectPageComponent, OwnerToolsComponent, LeaderboardComponent } from './project-page'
import { FirefeedComponent } from './project-page/owner-tools/firefeed/firefeed.component'
import { FirecardComponent } from './project-page/owner-tools/firefeed/firecard/firecard.component'
import { QuestionfeedComponent } from './project-page/owner-tools/questionfeed/questionfeed.component'
import { QuestioncardComponent } from './project-page/owner-tools/questionfeed/questioncard/questioncard.component'
import {
  NewReadingPage,
  UploadModalComponent,
  UploadPdfModalComponent,
  DeletePdfMiniModal,
  GradeSelector,
} from './new-reading-page'
import {
  DashboardComponent,
  JoinedDashComponent,
  CreatedDashComponent,
  TutorialReadingComponent,
  ReadingCardComponent,
} from './dashboard'
import { NoContentComponent } from './no-content'
import { AccountComponent, ChangePassComponent, UploadAvatarModal } from './account'
import { LoginComponent } from './login'
import { RedeemToken } from './redeem-token/redeem-token.component'
import { HeroPromoPageComponent } from './hero-promo/hero-promo.component'
import { HeroPricingComponent } from './hero-pricing/hero-pricing.component'
import { DiscoverFeedComponent } from './discover-feed/discover-feed.component'
import { OAuthComponent } from './oauth-redirect/oauth-redirect.component'
import { GoogleButton, CleverButton } from './buttons'
import { CommentPaneComponent } from './shared/comment-pane/comment-pane.component'
import { DataListModule } from 'primeng/datalist'
import { PaginatorModule } from 'primeng/paginator'
import { TooltipModule } from 'primeng/tooltip'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule, PreloadAllModules, Router, ExtraOptions } from '@angular/router'
import { ROUTES } from './app.routes'
import { LicenseRedirectComponent } from './license-redirect/license-redirect.component'
import { LicenseWelcomeComponent } from './license-welcome/license-welcome.component'
import { ReadingRecapComponent } from './project-page/owner-tools/reading-recap/reading-recap.component'
import { TeamPageComponent } from './team-page/team-page.component'
import { SearchPage } from './search-page/search-page.component'
import { TeacherFeedbackComponent } from './annotator/teacher-feedback/teacher-feedback.component'
import { MetricsEffects } from './_reducers/metrics.effects'
import { CopyService } from './_services/copy.service'

// Configure Hammer.js
export class MyHammerConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement) {
    // Enable polyfill for touch actions to support scrolling on top of tap bindings
    let mc = new Hammer(element, {
      touchAction: 'pan-y',
    })
    mc.get('pan').set({ enable: false })
    return mc
  }
  overrides = <any>{
    // override default gesture settings
    //  Tap overrides for Chrome v71 sensitivity when making comments
    tap: {
      time: 2000, // default: 250 / Maximum press time in ms.
      threshold: 5, //	default: 2 / While doing a tap some time spent moving is allowed.
      posThreshold: 10, // default: 10 / While tapping some position movement is allowed
      interval: 10, // default: 300 / we don't care about supporting double taps
    },
  }
}

// Application wide providers
const APP_PROVIDERS = [
  // ...APP_RESOLVER_PROVIDERS,
  // AppState,
  AuthService,
  CopyService,
  DashboardGuardService,
  ReadingService,
  MediaService,
  MessageService,
  ProjectService,
  ProjectStore,
  ProjectListStore,
  CommentService,
  SocketService,
  UtilToolService,
  BumblebeeService,
  MailchimpService,
  StateService,
  {
    provide: HAMMER_GESTURE_CONFIG,
    useClass: MyHammerConfig,
  },
  // ,
  // { provide: ErrorHandler, useClass: SentryErrorHandler }
  // { provide: RouteReuseStrategy, useClass: ReuseStrategy }
] // const APP_PROVIDERS

const routerOptions: ExtraOptions = {
  useHash: true,
  anchorScrolling: 'enabled',
}

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    ClickOutsideDirective,
    RedeemToken,
    RegisterPageComponent,
    CreateProfilePageComponent,
    CommentPaneComponent,
    CommentComponent,
    TeacherFeedbackComponent,
    AvatarPortalComponent,
    TextCommentComponent,
    EmojiCommentComponent,
    AudioCommentComponent,
    EmojiKeyboardComponent,
    QuestionComponent,
    CleverButton,
    GoogleButton,
    OauthRowComponent,
    OpenEndedAnswersComponent,
    AppComponent,
    AccountComponent,
    LoginForm,
    RegisterFormComponent,
    ProfileFormComponent,
    GuestForm,
    LoginModal,
    LoginRegisterModal,
    AddProjectModal,
    ReadingArchivedModal,
    ConfirmArchiveModal,
    ConfirmCoOwnerModal,
    ReadingLinkModal,
    ReadingPreviewModal,
    ChangePassComponent,
    ResetPassComponent,
    DeleteCommentModal,
    DeleteReadingModal,
    DeleteProjectModal,
    TutorialGifModalComponent,
    UploadAvatarModal,
    AnnotatorComponent,
    NewReadingPage,
    GradeSelector,
    OAuthComponent,
    HeroPromoPageComponent,
    HeroPricingComponent,
    DiscoverFeedComponent,
    DiscoverAddMetaModal,
    LeaderboardComponent,
    FirefeedComponent,
    FirecardComponent,
    QuestionfeedComponent,
    QuestioncardComponent,
    UploadModalComponent,
    TutorialReadingComponent,
    UploadPdfModalComponent,
    DeletePdfMiniModal,
    ProjectPageComponent,
    OwnerToolsComponent,
    LoginRequiredModal,
    HeroChangeComponent,
    TutorialBoxComponent,
    DashboardComponent,
    JoinedDashComponent,
    CreatedDashComponent,
    LoginComponent,
    BadgeRowComponent,
    TweetCarouselComponent,
    HomeComponent,
    NoContentComponent,
    UserDetailsUpdateModal,
    ReadingCardComponent,
    ResetComponent,
    HeroPromoPageComponent,
    HeroPricingComponent,
    ScrollProgressComponent,
    SearchPage,
    LicenseRedirectComponent,
    LicenseWelcomeComponent,
    ReadingRecapComponent,
    TeamPageComponent,
    PromoBannerComponent,
    SchoolSelectorComponent,
  ],
  /** Components which can be dynamically created */
  entryComponents: [UserDetailsUpdateModal],
  imports: [
    // import Angular's modules
    SharedModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LockerModule,
    MediumEditorModule,
    MultiselectDropdownModule,
    Angulartics2Module.forRoot({
      pageTracking: {
        clearIds: true,
      },
      // gst: {
      //   trackingIds: ['UA-83792906-1'],
      // }
    }),
    RouterModule.forRoot(ROUTES, routerOptions),
    DataListModule,
    PaginatorModule,
    TooltipModule,
    NgxPageScrollModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([MetricsEffects]),
  ],
  providers: [
    // expose our Services and Providers into Angular's dependency injection
    // ENV_PROVIDERS,
    APP_PROVIDERS,
  ],
}) //@NgModule
export class AppModule {}
