import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core'
import { Router } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, AcademyService } from '../../_services'
import { Copy } from '../../shared'
import { take } from 'rxjs/operators';

@Component({
  selector: 'hot-login-form',
  templateUrl: 'login-form.component.html'
})
export class LoginForm implements OnInit {

  @Input()
  public submitText: string = 'Log In'

  @Output()
  public loginSuccess: EventEmitter<any> = new EventEmitter()

  public loginLoading: boolean = false

  public loginForm: FormGroup
  public userCopy: any = {}
  public errorObject: {
    "loginFailed"?: string,
    "serverError"?: string
  } = {}
  public submitted: boolean = false

  constructor(
    private _academy: AcademyService,
    private _auth: AuthService,
    private _router: Router,
    private angulartics: Angulartics2,
    fb: FormBuilder
  ) {
    this.userCopy = new Copy().getUserCopy()
    
    this.loginForm = fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    })
  }

  ngOnInit() {
  }

public login(formValue: any): void {
    this.loginLoading = true
    this.submitted = true

		this._auth.login(formValue)
      .pipe(take(1))
      .subscribe(
        (data: any)  => { 
          this.loginLoading = false
          this.clearErrors()

          // sets username and email for analytics use
          if (data.user) {
            // fire an analytic event here for tracking purposes
            this.angulartics.eventTrack.next({ 
              action: 'login', 
              properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() }
            })
          }
          if (data.token) {
            this.loginSuccess.emit(data.user)
          }

          // send the data to Pipo to track logins if they are a teacher
          if(data.user.identities && data.user.identities.indexOf('teacher') > -1 || data.user.identities.indexOf('administrator') > -1) {
            this._academy.pipoEvent({
              // standard event info:
              event_name: "login",
              user_id: data.user._id,
              teacher: true,
              hero: data.user.hero_status || false,
              institution_id: data.user.institution_ids || []
            })
          }
        },
        (error) =>  { 
          this.loginLoading = false
          if (error.status === 400) {
            this.errorObject.loginFailed = "We are missing the username or password!"
          } else if (error.status === 401) {
            this.errorObject.loginFailed = "Password is incorrect for that username"
          } else if (error.status === 404) {
            this.errorObject.loginFailed = "There might be a network error!"
          } else {
            console.error(error)
            this.errorObject.serverError = "Oh no, something went wrong and we don't know what it is!"
          }
        }
      )
}

  /**
   * Clears all errorObject strings to equal empty strings
   */
  private clearErrors(): void {
    for (let property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = ""
      }
    }
  }
}