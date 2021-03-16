import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Component, Output, EventEmitter, OnInit } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService } from '../../_services/auth.service'

@Component({
  selector: 'edji-set-pass',
  templateUrl: 'set-pass.component.html',
})
export class SetPassComponent implements OnInit {
  public passwordForm: FormGroup
  public currentUser: any
  public messages: {
    success?: boolean
    serviceError?: boolean
  } = {}
  public loading: boolean
  @Output() closeModal = new EventEmitter()

  private subscriptions: any[] = []
  
  constructor(private _auth: AuthService, private angulartics: Angulartics2, fb: FormBuilder) {
    this.passwordForm = fb.group(
      {
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

  public onSubmit(value: any): void {
    this.messages = {}
    if (!this.passwordForm.valid) {
      return
    }
    this.loading = true

    this._auth
      .setPassword({
        email: this.currentUser.email,
        new_password: this.passwordForm.get('new_password').value,
      })
      .then(res => {
        this.messages.success = true
        this.loading = false
        // fire an analytic event here for tracking purposes
        this.angulartics.eventTrack.next({
          action: 'set_password_request',
          properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
        })
        this._auth.setToken(res.token)
      })
      .catch(err => {
        this.loading = false
        // TRACK EXCEPTION
        console.error(err)
        this.messages.serviceError = true
      })
  }

  public closeAndReset() {
    this.closeModal.emit()
  }
}
