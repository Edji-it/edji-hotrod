import { Component, OnInit } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService } from './../_services'
import { User } from '../shared/datatypes'

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
  private user: User

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private route: ActivatedRoute,
    private angulartics: Angulartics2,
    private _fb: FormBuilder
  ) {
    
  }

  ngOnInit() {
    this.redeemType = this.route.snapshot.params['type']
    this.resetToken = this.route.snapshot.params['token']
    this.userId = this.route.snapshot.queryParams['user_id']
    if (!this.resetToken) {
      this._router.navigate(['/login'])
    }
    // Set form field validates based on type
    let fieldValidators: any[] = [Validators.required]
    // We want this to be flexible, so let's set the copy based on the generated link from the server
    switch (this.redeemType) {
      case 'password':
        this.redeemCopy = {
          name: 'Password'
        }
        fieldValidators.push(Validators.minLength(6))
        break
      case 'email':
        this.redeemCopy = {
          name: 'Email'
        }
        break
    }
    // Build reset form
    this.resetForm = this._fb.group({
      field: [null, Validators.compose(fieldValidators)],
      fieldConfirm: [null, Validators.required]
    }, { validator: this.fieldsEqual })

    this._auth.getCurrentUser().subscribe((user) => {
      this.user = user
    })
  }

  /** Validates that the fields are equal and assigns error if not
   * @returns error to FormGroup called 'mismatch' if the fields are not equal
   */
  private fieldsEqual(group: FormGroup): any {
    return group.get('field').value === group.get('fieldConfirm').value
      ? null : { mismatch: true }
  }

  public resetValue(formValue: any): void {
    this.submitted = true
    if (!this.resetForm.valid) {
      return
    }
    this.isLoading = true

    this._auth.resetProperty({ newValue: formValue.field, token: this.resetToken, type: this.redeemType, userId: this.userId })
    .subscribe((res) => {
      this.isLoading = false
      if (this.user.isLoggedIn) {
        this._router.navigate(['/dashboard'])
      } else {
        this.serviceResponse.success = true
      }
    },(err) => {
      this.isLoading = false
      this.serviceResponse.failure = true
    })
  }
}