import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'hot-reset-pass-page',
  templateUrl: 'reset-pass-page.component.html'
})
export class ResetPassPage implements OnInit {
  private resetForm: FormGroup;
  private isLoading: boolean = false;

  constructor(_fb: FormBuilder) {
    this.resetForm = _fb.group({
      password: [null, Validators.required],
      passwordConfirm: [null, Validators.required]
    }, { validator: this.passwordsEqual });
  }

  ngOnInit() { }

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

    console.log(formValue);
  }
}