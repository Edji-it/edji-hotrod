import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Output, EventEmitter } from '@angular/core';

import { AuthService } from './../shared/auth.service';

@Component({
  selector: 'edji-reset-pass',
  templateUrl: 'reset-pass.component.html'
})
export class ResetPassComponent {

  @Output()
  closeModal = new EventEmitter();

  private passwordForm: FormGroup;
  private responseSuccess: boolean;
  private submissionSuccess: boolean = false;
  private errorObject: any = { };

  constructor(fb: FormBuilder, private _auth: AuthService) {
    this.passwordForm = fb.group({
      username: [null, Validators.required]
    });
  }

  private onSubmit(formValue: any): void {
    this.clearErrors();
    this._auth.recoverPassword( formValue.username )
      .subscribe((success) => {
        if (success) {
          this.submissionSuccess = true;
        } else {
          this.errorObject.unsuccessful = "We were unable to send the email";
        }
      });

    // this._auth.resetPassword({
    //     oldPassword: this.passwordForm.get('oldPassword').value,
    //     newPassword: this.passwordForm.get('newPassword').value
    //   })
    //   .then((res) => {
    //     this.responseSuccess = true;
    //     this._auth.setToken(res.token);
    //   })
    //   .catch((res) => {
    //     this.responseSuccess = false;
    //     console.log("no dice! 🎲");
    //   });
  }

  /**
   * Clears all errorObject strings to equal empty strings
   */
  private clearErrors(): void {
    for (let property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = "";
      }
    }
  }
}