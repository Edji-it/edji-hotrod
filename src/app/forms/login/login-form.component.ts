import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { Router } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, AcademyService } from '../../_services'
import { Copy } from '../../shared'

@Component({
  selector: 'hot-login-form',
  templateUrl: 'login-form.component.html'
})
export class LoginForm implements OnInit {

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
    this.angulartics.eventTrack.next({ action: 'loginMain', properties: { category: 'login', label: 'attempt' }})

    this.loginLoading = true
    this.submitted = true

		this._auth.login(formValue)
      .then(
        (data)  => { 
          this.loginLoading = false
          this.clearErrors()

          // sets username and email for analytics use
          if (data.user) {
            data.user.username && this.angulartics.setUsername.next(data.user.username)
            data.user.email && this.angulartics.setUserProperties.next({ email: data.user.email})
            if (data.user.identities) {
              data.user.identities.forEach((identity) => {
                let userProperty: any = {}
                userProperty[identity] = true
                this.angulartics.setUserProperties.next(userProperty)
              })
            }
            this.angulartics.eventTrack.next({ action: 'loginMain', properties: { category: 'login', label: 'success' }})
          } else {
            this.angulartics.eventTrack.next({ action: 'loginMain', properties: { category: 'login', label: 'failure' }})
            // there are other fields that the call should contain, like 'label' 'value' and 'interactionType'
            // this.angulartics.exceptionTrack.next({ appId: 'app', appName: 'Test App', appVersion: '0.1' })
          }

          if (data.token) {
            this._auth.setToken(data.token)
            this._auth.setUser(data.user)
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
            this.angulartics.eventTrack.next({ action: 'loginMain', properties: { category: 'login', label: 'failure' }})
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