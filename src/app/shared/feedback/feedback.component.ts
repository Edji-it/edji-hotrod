import { Component } from '@angular/core';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from './..';

@Component({
  selector: 'edji-feedback',
  templateUrl: 'feedback.component.html',
  styles: [`
  `]
})
export class FeedbackComponent {
  private showFeedbackModal: true;
  private feedbackForm: FormGroup;
  private user: any;

  constructor(
    private _auth: AuthService,
    fb: FormBuilder
  ) {
    this.user = this._auth.getUser();

    this.feedbackForm = fb.group({
      name: [this.user.fullname, Validators.required],
      email: [this.user.email, Validators.compose([Validators.required, this.emailValidator])],
      content: [null, Validators.required]
    })
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    let emailRe: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRe.test(control.value) ? null : { 'emailIncorrect': true };
  }

  private sendFeedback(formValue: any) {
    console.log(formValue);
  }
}