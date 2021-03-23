import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Component, Output, EventEmitter } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService } from './../../_services'
import { ALLSPARK } from '../../app.constants'

@Component({
  selector: 'edji-reset-pass',
  templateUrl: 'reset-pass.component.pug',
})
export class ResetPassComponent {
  @Output()
  closeModal: EventEmitter<any> = new EventEmitter()

  public passwordForm: FormGroup
  public responseSuccess: boolean
  public submissionSuccess: boolean = false
  public errorObject: any = {}
  public loading: boolean = false
  public sentName: string = ''

  constructor(private _auth: AuthService, private angulartics: Angulartics2, fb: FormBuilder) {
    this.passwordForm = fb.group({
      username: [null, Validators.required],
    })
  }

  public onSubmit(formValue: any): void {
    let enteredValue: string = formValue.username
    let resetUser = {}
    this.loading = true
    this.clearErrors()
    // Username or Email?
    if (ALLSPARK.EMAILREGEX.test(enteredValue)) {
      resetUser['email'] = enteredValue
    } else {
      resetUser['username'] = enteredValue
    }

    this._auth
      .recoverPassword(resetUser)
      .pipe(take(1))
      .subscribe(
        success => {
          this.sentName = enteredValue
          this.loading = false
          // fire an analytic event here for tracking purposes
          this.angulartics.eventTrack.next({
            action: 'change_password_request',
            properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
          })
          this.submissionSuccess = true
        },
        err => {
          this.loading = false
          this.submissionSuccess = false
          if (err.status == 400) {
            let errorBody = err.error

            // Removed oauth check now that we are allowing them to set a password
            // Other 400 account error
            this.errorObject.unsuccessful =
              "<b>Account Error</b> We were unable to reset your account, please <a class='link' href='mailto:support@edji.it'>contact support</a>"
          } else if (err.status == 404) {
            // Account not found
            this.errorObject.unsuccessful = '<b>Account Not Found</b> We were unable to find that account'
          } else {
            // Generic server error
            this.errorObject.unsuccessful = '<b>Server Error</b> We were unable to send the reset email'
          }
        },
      )
  }

  /**
   * Clears all errorObject strings to equal empty strings
   */
  private clearErrors(): void {
    for (let property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = ''
      }
    }
  }

  /**
   * Close modal
   * - Clears form for use when reopened
   */
  public close(): void {
    // Clear form
    this.clearErrors()
    this.passwordForm.reset()
    this.submissionSuccess = false
    // Trigger close
    this.closeModal.emit()
  }
}
