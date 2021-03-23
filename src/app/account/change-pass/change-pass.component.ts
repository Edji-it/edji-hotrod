import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Component, Output, EventEmitter, OnInit } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService } from './../../_services/auth.service'

@Component({
  selector: 'edji-change-pass',
  templateUrl: 'change-pass.component.html',
})
export class ChangePassComponent implements OnInit {
  public passwordForm: FormGroup
  public currentUser: any
  public messages: {
    success?: boolean
    wrongPasswordError?: boolean
    serviceError?: boolean
  } = {}
  public loading: boolean
  @Output() closeModal = new EventEmitter()

  private subscriptions: any[] = []

  constructor(private _auth: AuthService, private angulartics: Angulartics2, fb: FormBuilder) {
    this.passwordForm = fb.group(
      {
        old_password: [null, Validators.required],
        new_password: [null, [Validators.required, Validators.minLength(6)]],
        newPasswordConfirm: [null, Validators.required],
      },
      { validator: this.passwordsEqual },
    )
  }

  ngOnInit() {
    this.subscriptions.push(
      this._auth.currentUser.subscribe(user => {
        this.currentUser = user
        this.setOldPasswordRequired(user.has_password)
      }),
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  //https://angular.io/docs/ts/latest/api/forms/index/FormGroup-class.html
  private passwordsEqual(group: FormGroup) {
    return group.get('new_password').value === group.get('newPasswordConfirm').value ? null : { mismatch: true }
  }

  private setOldPasswordRequired(old_password_required: boolean) {
    if(old_password_required)
      this.passwordForm.get("old_password").enable()
    else
      this.passwordForm.get("old_password").disable()
  }

  public onSubmit(value: any): void {
    this.messages = {}
    if (!this.passwordForm.valid) {
      return
    }
    this.loading = true

    this._auth
      .resetPassword({
        old_password: this.passwordForm.get('old_password').value,
        new_password: this.passwordForm.get('new_password').value,
      })
      .then(res => {
        this.messages.success = true
        this.loading = false
        // fire an analytic event here for tracking purposes
        this.angulartics.eventTrack.next({
          action: 'change_password_request',
          properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
        })
        this._auth.setToken(res.token)
      })
      .catch(err => {
        this.loading = false
        if (err.status === 403) {
          this.messages.wrongPasswordError = true
        } else {
          // TRACK EXCEPTION
          console.error(err)
          this.messages.serviceError = true
        }
      })
  }

  public closeAndReset() {
    this.closeModal.emit()
  }
}
