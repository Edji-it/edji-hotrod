import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Angulartics2 } from 'angulartics2';

import { AuthService, Copy } from '../../shared';

@Component({
  selector: 'hot-login-form',
  templateUrl: 'login-form.component.html'
})
export class LoginForm implements OnInit {

  @Output()
  private loginSuccess: EventEmitter<any> = new EventEmitter();

  private loginLoading: boolean = false;

  private loginForm: FormGroup;
  private userCopy: any = {};
  private errorObject: {
    "loginFailed"?: string,
    "serverError"?: string
  } = {};

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private angulartics: Angulartics2,
    fb: FormBuilder
  ) {
    this.userCopy = new Copy().getUserCopy();
    
    this.loginForm = fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  ngOnInit() {
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
                let userProperty: any = {};
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
            this.loginSuccess.emit(data.user);
          }
        },
        (error) =>  { 
          this.loginLoading = false;
          if (error.status === 400) {
            this.errorObject.loginFailed = "We are missing the username or password!";
          } else if (error.status === 401) {
            this.errorObject.loginFailed = "Password is incorrect for that username";
          } else if (error.status === 404) {
            this.errorObject.loginFailed = "There might be a network error!";
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