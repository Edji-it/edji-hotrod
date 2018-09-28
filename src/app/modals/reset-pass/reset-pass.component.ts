import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Component, Output, EventEmitter } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService } from './../../_services'
import { ALLSPARK } from '../../app.constants';

@Component({
  selector: 'edji-reset-pass',
  templateUrl: 'reset-pass.component.html'
})
export class ResetPassComponent {

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter()

  public passwordForm: FormGroup
  public responseSuccess: boolean
  public submissionSuccess: boolean = false
  public errorObject: any = { }
  public submitted: boolean = false
  public loading: boolean = false
  public sentName: string = ""

  constructor(private _auth: AuthService, private angulartics: Angulartics2, fb: FormBuilder) {
    this.passwordForm = fb.group({
      username: [null, Validators.required]
    })
  }

  public onSubmit(formValue: any): void {
    let enteredValue: string = formValue.username
    let resetUser = {}
    this.loading = true
    this.clearErrors()

    this.angulartics.eventTrack.next({ action: 'requestPasswordEmail', properties: { category: 'accountManagement', label: 'attempt' }})
    // Username or Email?
    if (ALLSPARK.EMAILREGEX.test(enteredValue)) {
      resetUser["email"] = enteredValue
    } else {
      resetUser["username"] = enteredValue
    }

    this._auth.recoverPassword( resetUser )
      .pipe(take(1))
      .subscribe((success) => {
        this.sentName = enteredValue
        this.loading = false
        this.submitted = true
        this.angulartics.eventTrack.next({ action: 'requestPasswordEmail', properties: { category: 'accountManagement', label: 'success' }})
        this.submissionSuccess = true
      }, (err) => {
        let errorBody = err.json()
        this.loading = false
        console.error(err)
        this.angulartics.eventTrack.next({ action: 'requestPasswordEmail', properties: { category: 'accountManagement', label: 'failure' }})
        if (err.status == 400) {
          // User's password can't reset because it's an OAuth account
          if (errorBody.oauth_types && errorBody.oauth_types[0] == 'google') {
            this.errorObject.unsuccessful = "This is a Google account, please try signing in with Google."
          } else {
            this.errorObject.unsuccessful = "We were unable to reset your account, please <a class='link' href='mailto:support@edji.it'>contact support</a>"
          }
        } else if(err.status == 404) {
          this.errorObject.unsuccessful = "We were unable to find that account"
        } else {
          this.errorObject.unsuccessful = "We were unable to send the email"
        }
        
      })
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