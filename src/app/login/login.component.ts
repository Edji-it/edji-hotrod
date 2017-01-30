import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Angulartics2 } from 'angulartics2';

import { AppState } from '../app.service';
import { AuthService, ProjectService } from '../shared';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'hot-login',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  // Set our default values
  private sessionCode: String;
  private loginLoading: Boolean = false;

  private showPassModal: boolean = false;

  // TypeScript public modifiers
  constructor(
    private appState: AppState,
    private _auth: AuthService,
    private _project: ProjectService,
    private _router: Router,
  ) {
    // this makes the window always render scrolled to the top
    this._router.events.subscribe(() => {
      window.scrollTo(0, 0);
    });
  }

  ngOnInit() {
    if (this._auth.getUser()) {
      // do something if the user is already logged in?
    }
  }

  private loginSuccess(): void {
    this._router.navigate(['/dashboard']);
  }

}
