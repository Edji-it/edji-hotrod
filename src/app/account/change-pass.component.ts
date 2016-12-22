import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component } from '@angular/core';

import { AuthService } from './../shared/auth.service';

@Component({
  selector: 'edji-change-pass',
  templateUrl: 'change-pass.component.html'
})
export class ChangePassComponent {

  private passwordForm: FormGroup;
  private responseSuccess: boolean;

  constructor(fb: FormBuilder, private _auth: AuthService) {
    this.passwordForm = fb.group({
      oldPassword: [null, Validators.required],
      newPassword: [null, Validators.required],
      newPasswordConfirm: [null, Validators.required]
    }, { validator: this.passwordsEqual });
  }

//https://angular.io/docs/ts/latest/api/forms/index/FormGroup-class.html
  private passwordsEqual(group: FormGroup) {
    return group.get('newPassword').value === group.get('newPasswordConfirm').value
      ? null : {'mismatch': true};
  }

  private onSubmit(value: any): void {
    console.log("form data: ");
    console.log(value);
    // this._auth.resetPassword({
    //     oldPassword: this.passwordForm.get('oldPassword').value,
    //     newPassword: this.passwordForm.get('newPassword').value
    //   })
    //   .then((res) => {
    //     this.responseSuccess = true;
    //     this._auth.setToken(res.token);
    //     console.log("success!");
    //   })
    //   .catch((res) => {
    //     this.responseSuccess = false;
    //     console.log("no dice!");
    //     console.log(res);
    //   });
  }
}