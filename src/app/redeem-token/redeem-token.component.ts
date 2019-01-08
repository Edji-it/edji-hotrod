import { Component, OnInit } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService } from './../_services'

@Component({
  selector: 'hot-redeem-token',
  templateUrl: 'redeem-token.component.pug'
})
export class RedeemToken implements OnInit {
  public resetForm: FormGroup
  public isLoading: boolean = false
  public resetToken: string
  public serviceResponse: {
    success?: boolean,
    failure?: boolean
  } = {}
  public submitted: boolean
  public redeemType: any
  public redeemCopy: {
    name: string
  } = {
    name: 'Password'
  }
  public userId: string

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private route: ActivatedRoute,
    private angulartics: Angulartics2,
    _fb: FormBuilder
  ) {
    this.resetForm = _fb.group({
      field: [null, Validators.required],
      fieldConfirm: [null, Validators.required]
    }, { validator: this.fieldsEqual })
  }

  ngOnInit() {
    this.redeemType = this.route.snapshot.params['type']
    this.resetToken = this.route.snapshot.params['token']
    this.userId = this.route.snapshot.queryParams['user_id']
    if (!this.resetToken) {
      this._router.navigate(['/login'])
    }
    // We want this to be flexible, so let's set the copy based on the generated link from the server
    switch (this.redeemType) {
      case 'password':
        this.redeemCopy = {
          name: 'Password'
        }
        break
      case 'email':
        this.redeemCopy = {
          name: 'Email'
        }
        break
    }
  }

  /** Validates that the fields are equal and assigns error if not
   * @returns error to FormGroup called 'mismatch' if the fields are not equal
   */
  private fieldsEqual(group: FormGroup): any {
    return group.get('field').value === group.get('fieldConfirm').value
      ? null : { mismatch: true }
  }

  public resetValue(formValue: any): void {
    if (!this.resetForm.valid) {
      return
    }
    this.submitted = true
    this.isLoading = true

    this._auth.resetProperty({ newValue: formValue.field, token: this.resetToken, type: this.redeemType, userId: this.userId })
    .subscribe((res) => {
      this.isLoading = false
      this.serviceResponse.success = true
    },(err) => {
      this.isLoading = false
      this.serviceResponse.failure = true
    })
  }
}