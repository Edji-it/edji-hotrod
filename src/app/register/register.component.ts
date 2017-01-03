import { Component } from '@angular/core';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from './../shared/auth.service';

@Component({
  selector: 'edji-register',
  templateUrl: 'register.component.html'
})
export class RegisterComponent {
  private registerForm: FormGroup;

  constructor(
    private _auth: AuthService,
    fb: FormBuilder
  ) {
    this.registerForm = fb.group({
      username: [null, Validators.required],
      fullname: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, this.emailValidator])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(6)])],
      passwordConfirm: [null, Validators.required],
    }, { validator: this.passwordsEqual });
  }

  //https://angular.io/docs/ts/latest/api/forms/index/FormGroup-class.html
  private passwordsEqual(group: FormGroup) {
    return group.get('password').value === group.get('passwordConfirm').value
      ? null : {'mismatch': true};
  }

  private emailValidator(control: FormControl) {
    let emailRe: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRe.test(control.value) ? null : { 'emailIncorrect': true };
  }

  private register(formValue: any) {
    console.log(formValue);
  }
}