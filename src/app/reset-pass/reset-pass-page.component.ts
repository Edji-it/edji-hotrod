import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

import { AuthService } from './../shared';

@Component({
  selector: 'hot-reset-pass-page',
  templateUrl: 'reset-pass-page.component.html'
})
export class ResetPassPage implements OnInit {
  private resetForm: FormGroup;
  private isLoading: boolean = false;
  private resetToken: string;
  private serviceResponse: {
    success?: boolean,
    failure?: boolean
  } = {};

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private route: ActivatedRoute,
    private angulartics: Angulartics2,
    _fb: FormBuilder
  ) {
    this.resetForm = _fb.group({
      password: [null, Validators.required],
      passwordConfirm: [null, Validators.required]
    }, { validator: this.passwordsEqual });
  }

  ngOnInit() {
    this.resetToken = this.route.snapshot.queryParams['token'];
    if (!this.resetToken) {
      this._router.navigate(['/login']);
    }
  }

  //https://angular.io/docs/ts/latest/api/forms/index/FormGroup-class.html
  /** Validates that the passwords are equal and assigns error if not
   * @returns error to FormGroup called 'mismatch' if the passwords are not equal
   */
  private passwordsEqual(group: FormGroup): any {
    return group.get('password').value === group.get('passwordConfirm').value
      ? null : { mismatch: true };
  }

  private resetPass(formValue: any): void {
    if (!this.resetForm.valid) {
      return;
    }

    this._auth.resetPassword({ newPassword: formValue.password, token: this.resetToken })
      .then((res) => {
        if (res.user && res.token) {
          this.serviceResponse.success = true;
          res.user.username && this.angulartics.setUsername.next(res.user.username);
          res.user.email && this.angulartics.setUserProperties.next({ email: res.user.email});
        } else {
          this.serviceResponse.failure = true;
        }
      })
      .catch((err) => {
        console.error(err);
        this.serviceResponse.failure = true;
      });
  }
}