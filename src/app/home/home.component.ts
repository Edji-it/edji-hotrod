import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AppState } from '../app.service';
import { Title } from './title';
import { AuthService } from '../shared/auth.service';

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
export class HomeComponent implements OnInit {
  // Set our default values
  private sessionCode: String;
  private loginLoading: Boolean = false;

  private loginForm: FormGroup;
  private errorObject = {
    "invalidCode": "",
    "incorrect": ""
  };
  private user= {
    username: "",
    password: ""
  };
  private passwordModal = {
    username: "",
    sent: false,
    message: ""
  }

  // TypeScript public modifiers
  constructor(public appState: AppState,
    public title: Title,
    public _auth: AuthService,
    public router: Router,
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

  joinSession(code){

  }

  private login(formValue: any) {

    for (let property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = "";
      }
    }
		
    let user: any = {
      username: formValue.username,
      password: formValue.password
    };

		this.loginLoading = true;

		this._auth.login(user)
      .then(
        (data: any)  => { 
          console.log(data);
          this.loginLoading = false;

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

}
