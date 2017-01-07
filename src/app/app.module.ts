import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { removeNgStyles, createNewHosts, createInputTransfer } from '@angularclass/hmr';


import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { CoolStorageModule } from 'angular2-cool-storage';
import {LockerModule, Locker, LockerConfig} from 'angular2-locker';

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
import { AuthService } from './shared/auth.service';
import { ReadingService } from './shared/reading.service';
import { ProjectService } from './shared/project.service';
import { ReuseStrategy } from './route-reuse-strategy';
import { RouteReuseStrategy } from '@angular/router';

// Directives
import { MediumEditorDirective } from 'angular2-medium-editor/medium-editor.directive.ts';
import { ClickOutsideDirective } from 'angular2-click-outside/clickOutside.directive.ts';

// Pipes
import { EmojiOnePipe } from './shared/emojione.pipe.ts';

// Components
import { NavBarComponent } from './shared/nav-bar';
import { SideBarComponent } from './shared/side-bar';
import { FooterComponent } from './shared/footer';
import { HomeComponent, ResetPassComponent } from './home';
import { RegisterComponent } from './register';
import { JoinComponent } from './join/join.component';
import { AnnotatorComponent, CommentComponent, EmojiCommentComponent, EmojiKeyboardComponent } from './annotator';
import { ProjectPageComponent } from './project-page';
import { ReadingPageComponent, DeleteProjectComponent } from './reading-page';
import { NewReadingPage } from './new-reading-page';
import { DashboardComponent, StuDashComponent } from './dashboard';
import { NoContentComponent } from './no-content';
import { AccountComponent, ChangePassComponent } from './account';

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState,
  AuthService,
  ReadingService,
  ProjectService,
  { provide: RouteReuseStrategy, useClass: ReuseStrategy }
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
    RegisterComponent,
    NavBarComponent,
    SideBarComponent,
    FooterComponent,
    CommentComponent,
    EmojiCommentComponent,
    EmojiKeyboardComponent,
    AppComponent,
    AccountComponent,
    ChangePassComponent,
    ResetPassComponent,
    AnnotatorComponent,
    NewReadingPage,
    ProjectPageComponent,
    ReadingPageComponent,
    DeleteProjectComponent,
    DashboardComponent,
    StuDashComponent,
    HomeComponent,
    JoinComponent,
    NoContentComponent,
],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    LockerModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    NgbModule.forRoot() // Ng Bootstrap Import
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

