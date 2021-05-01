import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms'
import { Component, Output, EventEmitter, OnInit } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService } from './../../_services/auth.service'

@Component({
  selector: 'edji-unlink-oauth',
  styleUrls: ['./unlink-oauth.component.scss'],
  templateUrl: 'unlink-oauth.component.html',
})
export class UnlinkOAuthComponent implements OnInit {
  public unlinkOauthForm: FormGroup
  public oauthTypes: string[]
  public currentUser: any
  public messages: {
    success?: boolean
    serviceError?: boolean
  } = {}
  public loading: boolean
  @Output() closeModal = new EventEmitter()

  private subscriptions: any[] = []

  constructor(private _auth: AuthService, private angulartics: Angulartics2, fb: FormBuilder) {
    this.oauthTypes = [];
    this.unlinkOauthForm = fb.group(
      {
        oauth_account: [null, Validators.required],
        new_password: [null, [this.passwordValid]],
        new_password_confirm: [null, [this.passwordValid]],
      },
      { validator: this.passwordsEqual },
    )
  }

  ngOnInit() {
    this.subscriptions.push(
      this._auth.currentUser.subscribe(user => {
        this.currentUser = user
        Object.values(this.currentUser.oauth).forEach((entry: any) => {
          this.oauthTypes.push(entry.type);
        });
        if(this.oauthTypes.length === 1 && !this.currentUser.has_password) {
          this.unlinkOauthForm.get('new_password').setValidators([this.passwordValid]);
          this.unlinkOauthForm.get('new_password_confirm').setValidators([this.passwordValid]);
        } else {
          this.unlinkOauthForm.get('new_password').setValidators([]);
          this.unlinkOauthForm.get('new_password_confirm').setValidators([]);
        }
      }),
    )

    if(this.oauthTypes.length === 1 && !this._auth.getUser().has_password) {
      this.unlinkOauthForm.get('new_password').setValidators([this.passwordValid]);
      this.unlinkOauthForm.get('new_password_confirm').setValidators([this.passwordValid]);
    } else {
      this.unlinkOauthForm.get('new_password').setValidators([]);
      this.unlinkOauthForm.get('new_password_confirm').setValidators([]);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  //https://angular.io/docs/ts/latest/api/forms/index/FormGroup-class.html
  private passwordsEqual(group: FormGroup) {
    return group.get('new_password').value === group.get('new_password_confirm').value ? null : { mismatch: true }
  }

  private passwordValid(control: AbstractControl) {
    if(!control.value)
      return { required: true }
    
    if(control.value.length < 6)
      return { minlength: true }

    return null;
  }

  public onSubmit(value: any): void {
    this.messages = {}
    if (!this.unlinkOauthForm.valid) {
      return
    }
    this.loading = true

    this._auth
      .unlinkOauth({
        oauthType: this.unlinkOauthForm.get('oauth_account').value,
        newPassword: this.unlinkOauthForm.get('new_password').value
      })
      .then(res => {
        this.messages.success = true
        this.loading = false
        this.angulartics.eventTrack.next({
          action: 'unlink_oauth_request',
          properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
        })
      }).catch(error => {
        this.loading = false
        this.messages.serviceError = true
        console.error(error)
      })
  }

  public closeAndReset() {
    this.closeModal.emit()
  }
}
