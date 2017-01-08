import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from './..';

@Component({
  selector: 'edji-feedback',
  templateUrl: 'feedback.component.html',
  styles: [`
    .form-group { padding-top: 5px; }
    .modal {
      margin: 0 auto;
      width: 55%;
      left: auto;
    }
  `]
})
export class FeedbackComponent {
  private showFeedbackModal: true;
  private feedbackForm: FormGroup;
  private feedbackSuccess: boolean = false;
  private user: any;

  private errorObject: {
    serverError?: string
  } = {};

  constructor(
    private _auth: AuthService,
    private http: Http,
    fb: FormBuilder
  ) {
    this.user = this._auth.getUser();

    let prevData: any = this._auth.getFromStorage("feedbackFormData") || {};

    this.feedbackForm = fb.group({
      name: [this.user.fullname, Validators.required],
      email: [this.user.email, Validators.compose([Validators.required, this.emailValidator])],
      content: [prevData.content, Validators.required]
    })
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    let emailRe: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRe.test(control.value) ? null : { 'emailIncorrect': true };
  }

  /** Sends feedback to bumblebee */
  private sendFeedback(formValue: any): void {

    let data: any = {
      emailSubject: "Feedback form submitted!",
      formInfo: formValue,
      type: "feedback",
      user: this.user
    };

    this.http.post(
      "http://bumblebee-prod-1.us-west-2.elasticbeanstalk.com/newform",
      // "http://localhost:8333/newform",
      data,
      this._auth.getOptions()
    ).take(1).subscribe(
      (res) => {
        if (res.status === 204) {
          this.feedbackSuccess = true;
          this._auth.deleteFromStorage("feedbackFormData");
        }
      },
      (err) => {
        this.errorObject.serverError = "I'm sorry, something has gone wrong! Please try submitting your feedback again later!";
        this._auth.store("feedbackFormData", formValue);
      }
    )
  }
}