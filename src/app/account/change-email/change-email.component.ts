import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Component, Output, EventEmitter, OnInit } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService } from '../../_services/auth.service'

@Component({
  selector: 'edji-change-email',
  templateUrl: 'change-email.component.html',
})
export class ChangeEmailComponent implements OnInit {
  public emailForm: FormGroup
  public currentUser: any
  public messages: {
    success?: boolean
    wrongEmailError?: boolean
    serviceError?: boolean
  } = {}
  public loading: boolean
  @Output() closeModal = new EventEmitter()

  private subscriptions: any[] = []

  constructor(private _auth: AuthService, private angulartics: Angulartics2, fb: FormBuilder) {
    this.emailForm = fb.group(
      {
        current_email: [null, [Validators.required, Validators.minLength(6)]],
      },
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

  public onSubmit(value: any): void {
    this.messages = {}
    if (!this.emailForm.valid) {
      return
    }

    if(this.emailForm.get('current_email').value !== this.currentUser.email) {
      this.messages.wrongEmailError = true
      return
    }
    this.loading = true

    this._auth
      .resetEmail()
      .pipe(take(1))
      .subscribe(
        success => {
          this.messages.success = true
          this.loading = false
          this.angulartics.eventTrack.next({
            action: 'change_email_request',
            properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
          })
        },
        err => {
          this.loading = false
          // TRACK EXCEPTION
          console.error(err)
          this.messages.serviceError = true
        },
      )
  }

  public closeAndReset() {
    this.closeModal.emit()
  }
}
