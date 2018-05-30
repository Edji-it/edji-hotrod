import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Component, Output, EventEmitter, OnInit } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService } from './../../_services/auth.service'

@Component({
  selector: 'edji-change-pass',
  templateUrl: 'change-pass.component.html'
})
export class ChangePassComponent implements OnInit {

  public passwordForm: FormGroup;
  public messages: {
    success?: boolean,
    serviceError?: boolean
  } = {}
  public loading: boolean
  @Output() closeModal = new EventEmitter();

  constructor(private _auth: AuthService, private angulartics: Angulartics2, fb: FormBuilder) {
    this.passwordForm = fb.group({
      oldPassword: [null, Validators.required],
      newPassword: [null, Validators.required],
      newPasswordConfirm: [null, Validators.required]
    }, { validator: this.passwordsEqual });
  }

  ngOnInit() {
  }

//https://angular.io/docs/ts/latest/api/forms/index/FormGroup-class.html
  private passwordsEqual(group: FormGroup) {
    return group.get('newPassword').value === group.get('newPasswordConfirm').value
      ? null : {'mismatch': true};
  }

  public onSubmit(value: any): void {
    this.messages = {}
    this.loading = true
    this.angulartics.eventTrack.next({ action: 'resetPasswordLoggedIn', properties: { category: 'accountManagement', label: 'attempt' }})

    this._auth.resetPassword({
        oldPassword: this.passwordForm.get('oldPassword').value,
        newPassword: this.passwordForm.get('newPassword').value
      })
      .then((res) => {
        this.messages.success = true
        this.loading = false
        this.angulartics.eventTrack.next({ action: 'resetPasswordLoggedIn', properties: { category: 'accountManagement', label: 'success' }})
        this._auth.setToken(res.token)
      })
      .catch((err) => {
        // TRACK EXCEPTION
        console.error(err)
        this.loading = false
        this.angulartics.eventTrack.next({ action: 'resetPasswordLoggedIn', properties: { category: 'accountManagement', label: 'failure' }})
        this.messages.serviceError = true
      });
  }
}