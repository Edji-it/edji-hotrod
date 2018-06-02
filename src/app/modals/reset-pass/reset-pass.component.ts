import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Component, Output, EventEmitter } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService } from './../../_services'

@Component({
  selector: 'edji-reset-pass',
  templateUrl: 'reset-pass.component.html'
})
export class ResetPassComponent {

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter()

  public passwordForm: FormGroup
  public responseSuccess: boolean
  public submissionSuccess = false
  public errorObject: any = { }
  public submitted = false
  public loading = false

  constructor(private _auth: AuthService, private angulartics: Angulartics2, fb: FormBuilder) {
    this.passwordForm = fb.group({
      username: [null, Validators.required]
    })
  }

  public onSubmit(formValue: any): void {
    this.loading = true
    this.clearErrors()

    this.angulartics.eventTrack.next({ action: 'requestPasswordEmail', properties: { category: 'accountManagement', label: 'attempt' }})

    this._auth.recoverPassword( formValue.username )
      .pipe(take(1))
      .subscribe((success) => {
        this.loading = false
        this.submitted = true
        this.angulartics.eventTrack.next({ action: 'requestPasswordEmail', properties: { category: 'accountManagement', label: 'success' }})
        this.submissionSuccess = true
      }, (err) => {
        this.loading = false
        console.error(err)
        this.angulartics.eventTrack.next({ action: 'requestPasswordEmail', properties: { category: 'accountManagement', label: 'failure' }})
        this.errorObject.unsuccessful = 'We were unable to send the email'
      })
  }

  /**
   * Clears all errorObject strings to equal empty strings
   */
  private clearErrors(): void {
    for (const property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = ''
      }
    }
  }
}
