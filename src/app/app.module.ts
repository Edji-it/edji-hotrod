import { NgModule, ApplicationRef, ErrorHandler } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { RouterModule, PreloadAllModules, RouteReuseStrategy } from '@angular/router'
import { removeNgStyles, createNewHosts, createInputTransfer } from '@angularclass/hmr'

import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
// import { CoolStorageModule } from 'angular2-cool-storage'
import {LockerModule, Locker, LockerConfig} from 'angular2-locker'
import { Angulartics2Module } from 'angulartics2'
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga'
// import { HotkeyModule } from 'angular2-hotkeys'
/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment'
import { ROUTES } from './app.routes'
// App is our top level component
import { AppComponent } from './app.component'
import { APP_RESOLVER_PROVIDERS } from './app.resolver'

const { version: appVersion } = require('../../package.json')

// Services
import { AppState, InternalStateType } from './app.service'
import {
  AuthService,
  BumblebeeService,
  CommentService,
  MediaService,
  ProjectService,
  ReadingService,
  SocketService,
  UtilToolService
} from './shared'
import { ReuseStrategy } from './route-reuse-strategy'

// Directives
import { MediumEditorDirective } from 'angular2-medium-editor/medium-editor.directive.ts'
import { ClickOutsideDirective } from 'angular2-click-outside/clickOutside.directive.ts'
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect'

// Pipes
import { EmojiOnePipe, AddClassPipe } from './shared'
import { EdjiDatePipe } from './pipes/edjidate.pipe.ts'
import { LinkifyPipe } from './pipes/linkify.pipe'
import { UserInitialsPipe } from './pipes/userinitials.pipe.ts'

// Components
import {
  DiscussionsComponent,
  FooterComponent,
  NavBarComponent,
  OauthRowComponent,
  OpenEndedAnswersComponent,
  QuestionComponent,
  TutorialBoxComponent
} from './shared'
import { HomeComponent } from './home'
import { RegisterComponent } from './register'
import { LoginForm, GuestForm } from './forms'

import { LoginModal, UserDetailsUpdateModal, ResetPassComponent, DeleteCommentModal, DeleteAudioModal, DeleteReadingModal, DeleteProjectModal, AddProjectModal, LoginRequiredModal, HeroSubscribeComponent, HeroChangeComponent, LoginRegisterModal } from './modals'
import { AnnotatorComponent, CommentComponent, TextCommentComponent, EmojiCommentComponent, EmojiKeyboardComponent, AudioCommentComponent } from './annotator'
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

// Configure Hammer.js
export class MyHammerConfig extends HammerGestureConfig  {
  overrides = <any>{
      'swipe': {velocity: 0.4, threshold: 20} // override default settings
  }
} // export class MyHammerConfig extends HammerGestureConfig 

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState,
  AuthService,
  ReadingService,
  MediaService,
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

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
}; // tyep StoreType

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    MediumEditorDirective,
    ClickOutsideDirective,
    EmojiOnePipe,
    LinkifyPipe,
    EdjiDatePipe,
    UserInitialsPipe,
    ResetPassPage,
    AddClassPipe,
    RegisterComponent,
    NavBarComponent,
    FooterComponent,
    CommentPaneComponent,
    CommentComponent,
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
    HeroPricingComponent
  ],
  /** Components which can be dynamically created */
  entryComponents: [
    UserDetailsUpdateModal
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    LockerModule,
    MultiselectDropdownModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    Angulartics2Module.forRoot([ Angulartics2GoogleAnalytics ]),
    NgbModule.forRoot() // Ng Bootstrap Import
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
}) //@NgModule

export class AppModule {
  constructor(public appRef: ApplicationRef, public appState: AppState) {}

  hmrOnInit(store: StoreType) {
    if (!store || !store.state) return;
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    } // if

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  } //hmrOnInit()

  hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues  = createInputTransfer();
    // remove styles
    removeNgStyles();
  } // hmrOnDestroy

  hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  } // hmrAfterDestroy

} // export class AppModule

