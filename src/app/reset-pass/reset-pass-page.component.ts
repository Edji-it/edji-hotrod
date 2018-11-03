import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2 } from 'angulartics2';

// Project Dependencies
import { AuthService } from './../_services';

@Component({
  selector: 'hot-reset-pass-page',
  templateUrl: 'reset-pass-page.component.html'
})
export class ResetPassPage implements OnInit {
  public resetForm: FormGroup;
  public isLoading: boolean = false;
  public resetToken: string;
  public serviceResponse: {
    success?: boolean,
    failure?: boolean
  } = {};
  public submitted: boolean

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

  public resetPass(formValue: any): void {
    if (!this.resetForm.valid) {
      return;
    }
    this.submitted = true
    this.isLoading = true

    this._auth.resetPassword({ newPassword: formValue.password, token: this.resetToken })
      .then((res) => {
        this.isLoading = false
        if (res.user && res.token) {
          this.serviceResponse.success = true;
        } else {
          this.serviceResponse.failure = true;
        }
      })
      .catch((err) => {
        console.error(err);
        this.isLoading = false
        this.serviceResponse.failure = true;
      });
  }
}