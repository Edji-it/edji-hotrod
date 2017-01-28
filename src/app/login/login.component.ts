import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Angulartics2 } from 'angulartics2';

import { AppState } from '../app.service';
import { AuthService, ProjectService, Copy } from '../shared';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'hot-login',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  // Set our default values
  private sessionCode: String;
  private loginLoading: Boolean = false;

  private subscriptions: Subscription[] = [];

  private loginForm: FormGroup;
  private userCopy: any;
  private errorObject: {
    "loginFailed"?: string,
    "serverError"?: string
  } = {};

  private showPassModal: boolean = false;

  // TypeScript public modifiers
  constructor(
    private appState: AppState,
    private _auth: AuthService,
    private _project: ProjectService,
    private router: Router,
    private angulartics: Angulartics2,
    fb: FormBuilder
  ) {
    // this makes the window always render scrolled to the top
    this.router.events.subscribe(() => {
      window.scrollTo(0, 0);
    });

    this.loginForm = fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.userCopy = new Copy().getUserCopy();
    // this.title.getData().subscribe(data => this.data = data);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => { sub.unsubscribe(); });
  }

  private login(formValue: any): void {
    this.angulartics.eventTrack.next({ action: 'loginMain', properties: { category: 'login', label: 'attempt' }});

		this.loginLoading = true;

		this._auth.login(formValue)
      .then(
        (data: any)  => { 
          this.loginLoading = false;
          this.clearErrors();

          // sets username and email for analytics use
          if (data.user) {
            data.user.username && this.angulartics.setUsername.next(data.user.username);
            data.user.email && this.angulartics.setUserProperties.next({ email: data.user.email});
            if (data.user.identities) {
              data.user.identities.forEach((identity) => {
                let userProperty: any;
                userProperty[identity] = true;
                this.angulartics.setUserProperties.next(userProperty);
              })
            }
            this.angulartics.eventTrack.next({ action: 'loginMain', properties: { category: 'login', label: 'success' }});
          } else {
            this.angulartics.eventTrack.next({ action: 'loginMain', properties: { category: 'login', label: 'failure' }});
            // there are other fields that the call should contain, like 'label' 'value' and 'interactionType'
            // this.angulartics.exceptionTrack.next({ appId: 'app', appName: 'Test App', appVersion: '0.1' });
          }

          if (data.token) {
            this._auth.setToken(data.token);
            this._auth.setUser(data.user);
            this.router.navigate(['/dashboard']);
          }
        },
        (error) =>  { 
          this.loginLoading = false;
          if (error.status === 400) {
            this.errorObject.loginFailed = "We are missing the username or password!";
          } else if (error.status === 404) {
            this.errorObject.loginFailed = "Password is incorrect for that username";
          } else {
            this.angulartics.eventTrack.next({ action: 'loginMain', properties: { category: 'login', label: 'failure' }});
            this.errorObject.serverError = "Oh no, something went wrong and we don't know what it is!";
          }
        }
      );

  }

  /**
   * Clears all errorObject strings to equal empty strings
   */
  private clearErrors(): void {
    for (let property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = "";
      }
    }
  }

}
