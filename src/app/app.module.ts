import { NgModule, ApplicationRef, ErrorHandler, Injectable } from '@angular/core'
import { HttpModule } from '@angular/http'
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser'
import { LockerModule, Locker, LockerConfig} from 'angular-safeguard'
import { Angulartics2Module } from 'angulartics2'
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga'
import * as Sentry from "@sentry/browser";

// App is our top level component
import { AppComponent } from './app.component'
// Shared Module imports components between modules
import { SharedModule } from './app-shared.module';

import { Ng4TwitterTimelineModule } from './home/twitter-timeline';
import { NgxPageScrollModule } from 'ngx-page-scroll';

// Sentry Setup
const appVersion = require('../../package.json').version
Sentry.init({
  dsn: "https://f71b0ea0db5a4785b8ebee0b426b4bec@sentry.io/229527",
  release: appVersion
});

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
  UtilToolService
} from './_services'
// import { ReuseStrategy } from './route-reuse-strategy'

// Directives
import { MediumEditorDirective } from 'angular2-medium-editor'
import { MultiselectDropdownModule } from './_directives'
import { ClickOutsideDirective } from './_directives/click-outside.directive'

// Components
import {
  OauthRowComponent,
  OpenEndedAnswersComponent,
  QuestionComponent,
  ScrollProgressComponent,
  TutorialBoxComponent
} from './shared'
import { HomeComponent } from './home'
import { RegisterPageComponent } from './register-page'
import { LoginForm, GuestForm, RegisterFormComponent } from './forms'

import { LoginModal, UserDetailsUpdateModal, ResetPassComponent, DeleteCommentModal, DeleteReadingModal, DeleteProjectModal, AddProjectModal, LoginRequiredModal, HeroChangeComponent, LoginRegisterModal, DiscoverAddMetaModal } from './modals'
import { AnnotatorComponent, CommentComponent, TextCommentComponent, EmojiCommentComponent, EmojiKeyboardComponent, AudioCommentComponent, AvatarPortalComponent } from './annotator'
import { ProjectPageComponent, OwnerToolsComponent, LeaderboardComponent } from './project-page'
import { FirefeedComponent } from './project-page/owner-tools/firefeed/firefeed.component'
import { FirecardComponent } from './project-page/owner-tools/firefeed/firecard/firecard.component'
import { QuestionfeedComponent } from './project-page/owner-tools/questionfeed/questionfeed.component'
import { QuestioncardComponent } from './project-page/owner-tools/questionfeed/questioncard/questioncard.component'
import { NewReadingPage, UploadModalComponent, UploadPdfModalComponent, DeletePdfMiniModal, GradeSelector } from './new-reading-page'
import { DashboardComponent, JoinedDashComponent, CreatedDashComponent, TutorialReadingComponent, ReadingCardComponent } from './dashboard'
import { NoContentComponent } from './no-content'
import { AccountComponent, ChangePassComponent, UploadAvatarModal } from './account'
import { LoginComponent } from './login';
import { ResetPassPage } from './reset-pass/reset-pass-page.component';
import { HeroPromoPageComponent } from './hero-promo/hero-promo.component';
import { HeroPricingComponent } from './hero-pricing/hero-pricing.component';
import { DiscoverFeedComponent } from './discover-feed/discover-feed.component';
import { OAuthComponent } from './oauth-redirect/oauth-redirect.component'
import { GoogleButton } from './buttons'
import { CommentPaneComponent } from './shared/comment-pane/comment-pane.component'
import { HttpClientModule } from '@angular/common/http';
import { DataListModule } from 'primeng/datalist';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, PreloadAllModules, Router } from '@angular/router';
import { ROUTES } from './app.routes';
import { LicenseRedirectComponent } from './license-redirect/license-redirect.component';
import { LicenseWelcomeComponent } from './license-welcome/license-welcome.component';
import { ReadingRecapComponent } from './project-page/owner-tools/reading-recap/reading-recap.component';
import { TeamPageComponent } from './team-page/team-page.component';

// Configure Hammer.js
// export class MyHammerConfig extends HammerGestureConfig  {
//   overrides = <any>{
//       'swipe': {velocity: 0.4, threshold: 20} // override default settings
//   }
// } // export class MyHammerConfig extends HammerGestureConfig 

// Application wide providers
const APP_PROVIDERS = [
  // ...APP_RESOLVER_PROVIDERS,
  // AppState,
  AuthService,
  ReadingService,
  MediaService,
  MessageService,
  ProjectService,
  CommentService,
  SocketService,
  UtilToolService,
  BumblebeeService,
  { 
      provide: HAMMER_GESTURE_CONFIG, 
      useClass: HammerGestureConfig 
  }
  // ,
  // { provide: ErrorHandler, useClass: SentryErrorHandler }
  // { provide: RouteReuseStrategy, useClass: ReuseStrategy }
]; // const APP_PROVIDERS

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    MediumEditorDirective,
    ClickOutsideDirective,
    ResetPassPage,
    RegisterPageComponent,
    CommentPaneComponent,
    CommentComponent,
    AvatarPortalComponent,
    TextCommentComponent,
    EmojiCommentComponent,
    AudioCommentComponent,
    EmojiKeyboardComponent,
    QuestionComponent,
    GoogleButton,
    OauthRowComponent,
    OpenEndedAnswersComponent,
    AppComponent,
    AccountComponent,
    LoginForm,
    RegisterFormComponent,
    GuestForm,
    LoginModal,
    LoginRegisterModal,
    AddProjectModal,
    ChangePassComponent,
    ResetPassComponent,
    DeleteCommentModal,
    DeleteReadingModal,
    DeleteProjectModal,
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
    HomeComponent,
    NoContentComponent,
    UserDetailsUpdateModal,
    ReadingCardComponent,
    HeroPromoPageComponent,
    HeroPricingComponent,
    ScrollProgressComponent,
    LicenseRedirectComponent,
    LicenseWelcomeComponent,
    ReadingRecapComponent,
    TeamPageComponent
  ],
  /** Components which can be dynamically created */
  entryComponents: [
    UserDetailsUpdateModal
  ],
  imports: [ // import Angular's modules
    SharedModule,
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,
    LockerModule,
    MultiselectDropdownModule,
    Angulartics2Module.forRoot({
      pageTracking: {
        clearIds: true,
      }
    }),
    RouterModule.forRoot(ROUTES, { useHash: true }),
    DataListModule,
    PaginatorModule,
    TooltipModule,
    Ng4TwitterTimelineModule,
    NgxPageScrollModule
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    // ENV_PROVIDERS,
    APP_PROVIDERS
  ]
}) //@NgModule
export class AppModule { }