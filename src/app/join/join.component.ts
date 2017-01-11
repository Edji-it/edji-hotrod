import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Angulartics2 } from 'angulartics2';

import { AuthService } from './../shared/auth.service';
import { ProjectService } from './../shared/project.service';

@Component({
  selector: 'edji-join',
  templateUrl: 'join.component.html'
})
export class JoinComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  private projectCode: string;
  private guestForm: FormGroup;
  private loginForm: FormGroup;
  private loginLoading: Boolean = false;

  private errorObject = {
    "invalidCode": "",
    "badName": "",
    "incorrect": ""
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _auth: AuthService,
    private _project: ProjectService,
    private angulartics: Angulartics2,
    fb: FormBuilder
  ) {
    this.guestForm = fb.group({
      guestName: [null, Validators.required]
    });

    this.loginForm = fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        this.projectCode = params['code'];
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() });
  }

  /**
   * Happens when join as guest is pressed. First calls to sign in the tempuser and then navigates upon receiving project data
   */
  private joinSessionAsGuest(formValue: any): void {
    this.angulartics.eventTrack.next({ action: 'joinAsGuest', properties: { category: 'joinProject', label: 'attempt' }});

    // create the user's temporary account and set local token and user
    this._auth.createTempUser(formValue.guestName).subscribe(
      (data) => {
        this._auth.setToken(data.token);
        this._auth.setUser(data.user);

        // set the project as current project
        this.subscriptions.push(this._project.setCurrentProject(this.projectCode).subscribe(
          (project) => {
            if (project && project._id) {
              this.angulartics.eventTrack.next({ action: 'joinAsGuest', properties: { category: 'joinProject', label: 'success' }});
              this.router.navigate(['/project', project._id]);
            } else {
              // TRACK EXCEPTION
              console.warn('Didn\'t find project code yet.');
            }
            
          }
        ));

        this._project.setCurrentProject(this.projectCode);

        // after creation, navigate to the project's page
      },
      (error) => {
        if (error.status === 406) {
          this.errorObject.badName = ":anguished: Would you mind choosing another name?";
        } else {
          // TRACK EXCEPTION
          console.error(error);
        }
      }
    )
  }

  /**
   * Called when user joins project from login. Logs them in and then navigates to the route
   */
  private joinSessionAsUser(formValue: any) {
    this.clearErrors();
		this.loginLoading = true;

    this.angulartics.eventTrack.next({ action: 'joinAsUser', properties: { category: 'joinProject', label: 'attempt' }});

    // logs them in
		this._auth.login(formValue)
      .then(
        (data: any)  => { 
          this.loginLoading = false;

          if (data.token) {
            this._auth.setToken(data.token);
            this._auth.setUser(data.user);

            data.user.username && this.angulartics.setUsername.next(data.user.username);
            data.user.email && this.angulartics.setUserProperties.next({ email: data.user.email});
            data.user.isTeacher && this.angulartics.setUserProperties.next({ isTeacher: true });
            this.angulartics.eventTrack.next({ action: 'joinAsUser', properties: { category: 'joinProject', label: 'success' }});            

            // set the project as current project
            this.subscriptions.push(this._project.setCurrentProject(this.projectCode).subscribe(
              (project) => {
                if (project && project._id) {
                  this.router.navigate(['/project', project._id]);
                } else {
                  // TRACK EXCEPTION
                  console.warn('Didn\'t find project code yet.');
                }
                
              }
            ));

            this._project.setCurrentProject(this.projectCode);

          }
        },
        (error) =>  { 
          this.loginLoading = false;
          // TRACK EXCEPTION
          if (error === null) {
            this.errorObject.incorrect = "Network error";
          } else {
            this.errorObject.incorrect = "Password is incorrect for that username";
          }
        }
      );
  }

  private clearErrors() {
    for (let property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = "";
      }
    }
  }
}