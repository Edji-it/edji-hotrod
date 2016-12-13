import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AppState } from '../app.service';
import { Title } from './title';
import { XLarge } from './x-large';
import { AuthService } from '../auth.service';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'home',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
    Title,
    AuthService
  ],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './home.component.scss' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './home.component.html'
})
export class HomeComponent {
  // Set our default values
  private sessionCode: String;
  private submitted: Boolean = false;
  private loginLoading: Boolean = false;
  private errorObject = {
    "invalidCode": "",
    "noUsername": "",
    "noPassword": "",
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
  constructor(public appState: AppState, public title: Title, public _auth: AuthService, public router: Router) {

  }

  ngOnInit() {
    
    // this.title.getData().subscribe(data => this.data = data);
  }

  joinSession(code){

  }

  login(user) {
    this.submitted = true;
		// this.errorObject = { };

		if (!this.user.username) {
			this.errorObject.noUsername = "Please provide a username";
			return;
		}

		if (!this.user.password) {
			this.errorObject.noPassword = "Please provide a password";
			return;
		}

		this.loginLoading = true;

		this._auth.login(user)
      .then(
        (data)  => { 
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
          if (error === null) {
            this.errorObject.incorrect = "Network error";
          }
          if (error && error['error']) {
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
