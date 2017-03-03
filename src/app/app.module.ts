import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, PreloadAllModules, RouteReuseStrategy } from '@angular/router';
import { removeNgStyles, createNewHosts, createInputTransfer } from '@angularclass/hmr';

import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { CoolStorageModule } from 'angular2-cool-storage';
import {LockerModule, Locker, LockerConfig} from 'angular2-locker';
import { Angulartics2Module, Angulartics2GoogleAnalytics } from 'angulartics2';
// import { HotkeyModule } from 'angular2-hotkeys';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
// App is our top level component
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';

// Services
import { AppState, InternalStateType } from './app.service';
import { AuthService, BumblebeeService, ReadingService, ProjectService, SocketService } from './shared';
import { ReuseStrategy } from './route-reuse-strategy';

// Directives
import { MediumEditorDirective } from 'angular2-medium-editor/medium-editor.directive.ts';
import { ClickOutsideDirective } from 'angular2-click-outside/clickOutside.directive.ts';
import { Autosize } from 'angular2-autosize';

// Pipes
import { EmojiOnePipe } from './shared/emojione.pipe.ts';
import { AddClassPipe } from './shared/addclass.pipe.ts';

// Components
import { NavBarComponent } from './shared/nav-bar';
import { SideBarComponent } from './shared/side-bar';
import { FooterComponent } from './shared/footer';
import { HomeComponent } from './home';
import { RegisterComponent } from './register';
import { JoinComponent } from './join/join.component';
import { LoginForm, GuestForm } from './forms';
import { LoginModal, ResetPassComponent, DeleteCommentModal, AddProjectModal } from './modals';
import { AnnotatorComponent, CommentComponent, TextCommentComponent, EmojiCommentComponent, EmojiKeyboardComponent } from './annotator';
import { ProjectPageComponent, ProjectInfoComponent } from './project-page';
import { ReadingPageComponent, DeleteProjectComponent } from './reading-page';
import { NewReadingPage, UploadModalComponent } from './new-reading-page';
import { DashboardComponent, JoinedDashComponent, CreatedDashComponent, ReadingCardComponent } from './dashboard';
import { NoContentComponent } from './no-content';
import { AccountComponent, ChangePassComponent } from './account';
import { FeedbackComponent } from './shared/feedback/feedback.component';
import { LoginComponent } from './login';
import { ResetPassPage } from './reset-pass/reset-pass-page.component';

// Configure Hammer.js
export class MyHammerConfig extends HammerGestureConfig  {
  overrides = <any>{
      'swipe': {velocity: 0.4, threshold: 20} // override default settings
  }
}

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState,
  AuthService,
  ReadingService,
  ProjectService,
  SocketService,
  BumblebeeService,
  { 
      provide: HAMMER_GESTURE_CONFIG, 
      useClass: MyHammerConfig 
  }
  // { provide: RouteReuseStrategy, useClass: ReuseStrategy }
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    MediumEditorDirective,
    ClickOutsideDirective,
    EmojiOnePipe,
    ResetPassPage,
    AddClassPipe,
    RegisterComponent,
    NavBarComponent,
    SideBarComponent,
    FooterComponent,
    CommentComponent,
    TextCommentComponent,
    EmojiCommentComponent,
    EmojiKeyboardComponent,
    AppComponent,
    AccountComponent,
    LoginForm,
    GuestForm,
    LoginModal,
    AddProjectModal,
    ChangePassComponent,
    ResetPassComponent,
    DeleteCommentModal,
    AnnotatorComponent,
    NewReadingPage,
    UploadModalComponent,
    ProjectPageComponent,
    ProjectInfoComponent,
    ReadingPageComponent,
    DeleteProjectComponent,
    DashboardComponent,
    JoinedDashComponent,
    CreatedDashComponent,
    LoginComponent,
    HomeComponent,
    JoinComponent,
    FeedbackComponent,
    NoContentComponent,
    Autosize,
    ReadingCardComponent
],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    LockerModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    Angulartics2Module.forRoot([ Angulartics2GoogleAnalytics ]),
    NgbModule.forRoot() // Ng Bootstrap Import
    // HotkeyModule.forRoot()
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
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
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

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
  }

  hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}

