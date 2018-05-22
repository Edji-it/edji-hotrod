import { NgModule, ApplicationRef, ErrorHandler } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { RouterModule, PreloadAllModules, RouteReuseStrategy } from '@angular/router'
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser'
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { LockerModule, Locker, LockerConfig} from 'angular-safeguard'
import { Angulartics2Module } from 'angulartics2'
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga'

// App is our top level component
import { AppComponent } from './app.component'
import { ROUTES } from './app.routes'

// import { Ng4TwitterTimelineModule } from 'ng4-twitter-timeline/lib/index';

const { version: appVersion } = require('../../package.json')

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
} from './shared'
import { ReuseStrategy } from './route-reuse-strategy'

// Directives
// import { MediumEditorDirective } from 'angular2-medium-editor/medium-editor.directive'
import { MultiselectDropdownModule } from './_directives'
import { ClickOutsideDirective } from './_directives/click-outside.directive'

// Pipes
import { EmojiOnePipe, AddClassPipe } from './shared'
import { EdjiDatePipe } from './_pipes/edjidate.pipe'
import { LinkifyPipe } from './_pipes/linkify.pipe'
import { SubjectPipe } from './_pipes/subject.pipe'
import { UserInitialsPipe } from './_pipes/userinitials.pipe'

// Components
import {
  DiscussionsComponent,
  FooterComponent,
  NavBarComponent,
  OauthRowComponent,
  OpenEndedAnswersComponent,
  QuestionComponent,
  FollowTag,
  ScrollProgressComponent,
  TutorialBoxComponent
} from './shared'
import { HomeComponent } from './home'
import { RegisterComponent } from './register'
import { LoginForm, GuestForm } from './forms'

import { LoginModal, UserDetailsUpdateModal, ResetPassComponent, DeleteCommentModal, DeleteAudioModal, DeleteReadingModal, DeleteProjectModal, AddProjectModal, LoginRequiredModal, HeroSubscribeComponent, HeroChangeComponent, LoginRegisterModal, DiscoverAddMetaModal, ReferralModalComponent } from './modals'
import { AnnotatorComponent, CommentComponent, TextCommentComponent, EmojiCommentComponent, EmojiKeyboardComponent, AudioCommentComponent, AvatarPortalComponent } from './annotator'
import { ProjectPageComponent, ProjectInfoComponent, OwnerToolsComponent, LeaderboardComponent } from './project-page'
import { FirefeedComponent } from './project-page/owner-tools/firefeed/firefeed.component'
import { FirecardComponent } from './project-page/owner-tools/firefeed/firecard/firecard.component'
import { QuestionfeedComponent } from './project-page/owner-tools/questionfeed/questionfeed.component'
import { QuestioncardComponent } from './project-page/owner-tools/questionfeed/questioncard/questioncard.component'
import { NewReadingPage, UploadModalComponent, UploadPdfModalComponent, DeletePdfMiniModal, GradeSelector } from './new-reading-page'
import { DashboardComponent, JoinedDashComponent, CreatedDashComponent, TutorialReadingComponent, ReadingCardComponent } from './dashboard'
import { NoContentComponent } from './no-content'
import { AccountComponent, ChangePassComponent, UploadAvatarModal } from './account'
import { FeedbackComponent } from './shared/feedback/feedback.component'
import { ShareCodeComponent } from './modals/share-code/share-code.component'
import { LoginComponent } from './login';
import { ResetPassPage } from './reset-pass/reset-pass-page.component';
import { HeroPromoComponent } from './hero-promo/hero-promo.component';
import { HeroPricingComponent } from './hero-pricing/hero-pricing.component';
import { DiscoverFeedComponent } from './discover-feed/discover-feed.component';
import { OAuthComponent } from './oauth-redirect/oauth-redirect.component'
import { GoogleButton } from './buttons'
import { CommentPaneComponent } from './shared/comment-pane/comment-pane.component'
import { HttpClientModule } from '@angular/common/http';
import { DataListModule } from 'primeng/datalist';
import { PaginatorModule } from 'primeng/paginator';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Configure Hammer.js
export class MyHammerConfig extends HammerGestureConfig  {
  overrides = <any>{
      'swipe': {velocity: 0.4, threshold: 20} // override default settings
  }
} // export class MyHammerConfig extends HammerGestureConfig 

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
      useClass: MyHammerConfig 
  }
  // { provide: RouteReuseStrategy, useClass: ReuseStrategy }
]; // const APP_PROVIDERS

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    // MediumEditorDirective,
    ClickOutsideDirective,
    EmojiOnePipe,
    LinkifyPipe,
    SubjectPipe,
    EdjiDatePipe,
    UserInitialsPipe,
    ResetPassPage,
    AddClassPipe,
    RegisterComponent,
    NavBarComponent,
    FooterComponent,
    CommentPaneComponent,
    CommentComponent,
    AvatarPortalComponent,
    TextCommentComponent,
    EmojiCommentComponent,
    AudioCommentComponent,
    EmojiKeyboardComponent,
    QuestionComponent,
    FollowTag,
    GoogleButton,
    OauthRowComponent,
    OpenEndedAnswersComponent,
    AppComponent,
    AccountComponent,
    LoginForm,
    GuestForm,
    LoginModal,
    LoginRegisterModal,
    AddProjectModal,
    ChangePassComponent,
    ResetPassComponent,
    DeleteCommentModal,
    DeleteAudioModal,
    DeleteReadingModal,
    DeleteProjectModal,
    UploadAvatarModal,
    AnnotatorComponent,
    NewReadingPage,
    GradeSelector,
    OAuthComponent,
    HeroPromoComponent,
    HeroPricingComponent,
    DiscoverFeedComponent,
    DiscoverAddMetaModal,
    ReferralModalComponent,
    LeaderboardComponent,
    FirefeedComponent,
    FirecardComponent,
    QuestionfeedComponent,
    QuestioncardComponent,
    DiscussionsComponent,
    UploadModalComponent,
    TutorialReadingComponent,
    UploadPdfModalComponent,
    DeletePdfMiniModal,
    ProjectPageComponent,
    ProjectInfoComponent,
    OwnerToolsComponent,
    LoginRequiredModal,
    HeroSubscribeComponent,
    HeroChangeComponent,
    TutorialBoxComponent,
    DashboardComponent,
    JoinedDashComponent,
    CreatedDashComponent,
    LoginComponent,
    HomeComponent,
    FeedbackComponent,
    ShareCodeComponent,
    NoContentComponent,
    UserDetailsUpdateModal,
    ReadingCardComponent,
    HeroPromoComponent,
    HeroPricingComponent,
    ScrollProgressComponent
  ],
  /** Components which can be dynamically created */
  entryComponents: [
    UserDetailsUpdateModal
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    LockerModule,
    MultiselectDropdownModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    Angulartics2Module.forRoot([ Angulartics2GoogleAnalytics ]),
    // NgbModule.forRoot(), // Ng Bootstrap Import
    DataListModule,
    PaginatorModule
    // Ng4TwitterTimelineModule
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    // ENV_PROVIDERS,
    APP_PROVIDERS
  ]
}) //@NgModule
export class AppModule { }