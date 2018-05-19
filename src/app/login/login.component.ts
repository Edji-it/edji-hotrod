import { Title } from '@angular/platform-browser';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Angulartics2 } from 'angulartics2';

import { AuthService, ProjectService } from '../shared';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'hot-login',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  template: require('pug-loader!./login.component.pug')(),
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  // Set our default values
  private sessionCode: String;
  private loginLoading: Boolean = false;

  private showPassModal: boolean = false;

  // TypeScript public modifiers
  constructor(
    private _auth: AuthService,
    private _project: ProjectService,
    private _router: Router,
    private _title: Title
  ) {
    // this makes the window always render scrolled to the top
    this._router.events.subscribe(() => {
      window.scrollTo(0, 0)
    })
    
  }

  ngOnInit() {
    let user = this._auth.getUser()
    if (user && user.isLoggedIn) {
      this._router.navigate(['/dashboard'])
    }

    this._title.setTitle( 'Edji | Login' )
  }

  private loginSuccess(): void {
    this._router.navigate(['/dashboard'])
  }

  ngOnDestroy() {
      this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }
}
