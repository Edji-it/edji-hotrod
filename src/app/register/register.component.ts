import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from './../shared';

@Component({
  selector: 'edji-register',
  templateUrl: 'register.component.html'
})
export class RegisterComponent {
  private registerForm: FormGroup;

  constructor(
    private _auth: AuthService,
    private router: Router,
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
  /** Validates that the passwords are equal and assigns error if not
   * @returns error to FormGroup called 'mismatch' if the passwords are not equal
   */
  private passwordsEqual(group: FormGroup): any {
    return group.get('password').value === group.get('passwordConfirm').value
      ? null : {'mismatch': true};
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    let emailRe: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRe.test(control.value) ? null : { 'emailIncorrect': true };
  }

  /** Makes call to register the user */
  private register(formValue: any): void {
    console.log(formValue);
    this._auth.register(formValue)
      .subscribe((data) => {
        console.log(data);
        this.router.navigate(['dashboard']);
      }, (error) => {
        
      });
  }
}