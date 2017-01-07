import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

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
  private sessionCode: String;
  private loginLoading: Boolean = false;

  private subscriptions: Subscription[] = [];

  private loginForm: FormGroup;
  private errorObject = {
    "invalidCode": "",
    "incorrect": ""
  };

  private showPassModal: boolean = false;

  // TypeScript public modifiers
  constructor(
    private appState: AppState,
    private title: Title,
    private _auth: AuthService,
    private _project: ProjectService,
    private router: Router,
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
  private joinSession(code: string): void{
    this._project.validateProject(code)
      .subscribe(
        (data) => {
          this.router.navigate(['join', code]);
        },
        (error) => {
          console.log("it is a bad one");
          this.errorObject.invalidCode = "We don't think that's a real code :confused:";
        }
      );
  }

  private login(formValue: any): void {


		this.loginLoading = true;

		this._auth.login(formValue)
      .then(
        (data: any)  => { 
          this.loginLoading = false;
          this.clearErrors();

          // $analytics.setAlias(alias);
          // if (data.user && data.user.username) {
          //   $analytics.setUsername(data.user.username);
          //   		$analytics.setUserProperties({ 'email' : data.user.email });
          // } else {
          //   console.error("Couldn't find username!");
          // }

          // if (data.isTeacher) {
          // 	$analytics.eventTrack('Teacher logged in', {  category: 'Teacher', label: 'General' });
          // } else {
          // 	$analytics.eventTrack('Student logged in', {  category: 'Student', label: 'General' });
          // }

          if (data.token) {
            this._auth.setToken(data.token);
            this._auth.setUser(data.user);
            this.router.navigate(['/dashboard']);
          }
        },
        (error) =>  { 
          this.loginLoading = false;
          console.log(error);
          console.log(error._body);
          if (error === null) {
            this.errorObject.incorrect = "Network error";
          } else {
            this.errorObject.incorrect = "Password is incorrect for that username";
          }
        }
      );

  }
  
  showPasswordModal() {

  }

  resetPassword(username) {
    
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
