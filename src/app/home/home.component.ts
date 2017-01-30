import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Angulartics2 } from 'angulartics2';

import { AppState } from '../app.service';
import { Title } from './title';
import { AuthService } from '../shared/auth.service';
import { ProjectService } from './../shared/project.service';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'home',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
    Title
  ],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './home.component.scss' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  // Set our default values
  private projectCode: string;
  private joinLoading: boolean = false;

  private subscriptions: Subscription[] = [];

  private loginForm: FormGroup;
  private errorObject: {
    "invalidCode"?: string,
    "loginFailed"?: string,
    "serverError"?: string
  } = {};

  private showPassModal: boolean = false;

  // TypeScript public modifiers
  constructor(
    private appState: AppState,
    private title: Title,
    private _auth: AuthService,
    private _project: ProjectService,
    private router: Router,
    private angulartics: Angulartics2,
    fb: FormBuilder
  ) {
    this.loginForm = fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  ngOnInit() {
    
    // this.title.getData().subscribe(data => this.data = data);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => { sub.unsubscribe(); });
  }

  /**
   * Validates project and then navigates to project if valid
   * @param code The project's short code
   */
  private joinSession(code: string): void {
    console.log("first call", code);
    this.joinLoading = true;
    this.angulartics.eventTrack.next({ action: 'enterLightningCode', properties: { category: 'joinProject', label: 'attempt' }});
    this._project.validateProject(code)
      .take(1)
      .subscribe(
        (data) => {
          this.joinLoading = false;
          this.angulartics.eventTrack.next({ action: 'enterLightningCode', properties: { category: 'joinProject', label: 'success' }});
          if (data._id){
            this.router.navigate(['join', data._id]);
          } else {
            this.router.navigate(['join', code]);
          }
        },
        (error) => {
          this.joinLoading = false;
          if (error.status === 500) {
            this.angulartics.eventTrack.next({ action: 'enterLightningCode', properties: { category: 'joinProject', label: 'failure' }});
            this.errorObject.invalidCode = "Oh no! Something went wrong and we don't know what happened!";
          } else {
            this.errorObject.invalidCode = "We don't think that's a real code :confused:";
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
