import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService } from './../../_services'

@Component({
  selector: 'hot-guest-login',
  templateUrl: 'guest-form.component.html',
})
export class GuestForm implements OnInit {
  public guestForm: FormGroup

  @Output()
  public loginSuccess: EventEmitter<any> = new EventEmitter()

  public isLoading: boolean = false
  public errorObject: {
    invalidCode?: string
    badName?: string
    tempError?: string
    loginError?: string
  } = {}

  constructor(private _auth: AuthService, private angulartics: Angulartics2, fb: FormBuilder) {
    this.guestForm = fb.group({
      guestName: [null, Validators.required],
    })
  }

  ngOnInit() {}

  /**
   * Happens when join as guest is pressed. First calls to sign in the tempuser and then navigates upon receiving project data
   */
  public joinSessionAsGuest(formValue: any): void {
    this.isLoading = true

    // create the user's temporary account and set local token and user
    this._auth.createTempUser(formValue.guestName).subscribe(
      data => {
        this.isLoading = false
        this._auth.setToken(data.token)
        this._auth.setUser(data.user)

        this.loginSuccess.emit(data.user)
      },
      error => {
        this.isLoading = false
        if (error.status === 406) {
          this.errorObject.badName = ':anguished: Would you mind choosing another name?'
        } else {
          this.errorObject.tempError =
            "I'm sorry :disappointed: something didn't happen right. It's probably our fault."
          console.error(error)
        }
      },
    )
  }
}
