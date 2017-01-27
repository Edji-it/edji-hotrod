import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Angulartics2 } from 'angulartics2';

import { AuthService, Copy } from './..';

@Component({
  selector: 'edji-feedback',
  templateUrl: 'feedback.component.html',
  styles: [`
    .fixed-feedback-button {
      position: fixed;
      right: 25px;
      bottom: 10px;
      background: #b7b7b7;
      transition: transform 0.2s linear;
      padding: 8px;
      opacity: 0.8;
    }

    .fixed-feedback-button:hover {
      box-shadow: 0px 1px 8px 0px rgba(0,0,0,0.1);
      transform: scale(1.05);
      opacity: 1;
    }

    .fixed-feedback-button img {
      width: 30px;
      height: auto;
    }
  `]
})
export class FeedbackComponent implements OnInit {
  private showFeedbackModal: true;
  private feedbackForm: FormGroup;
  private feedbackSuccess: boolean = false;
  private user: any;
  private userCopy: any;

  private errorObject: {
    serverError?: string
  } = {};

  constructor(
    private _auth: AuthService,
    private http: Http,
    private angulartics: Angulartics2,
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

  ngOnInit() {
    this.userCopy = new Copy().getUserCopy();
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
    this.angulartics.eventTrack.next({ action: 'sendFeedback', properties: { category: 'accountManagement', label: 'attempt' }});

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
          this.angulartics.eventTrack.next({ action: 'sendFeedback', properties: { category: 'accountManagement', label: 'success' }});
          this.feedbackSuccess = true;
          this._auth.deleteFromStorage("feedbackFormData");
        }
      },
      (err) => {
        this.angulartics.eventTrack.next({ action: 'sendFeedback', properties: { category: 'accountManagement', label: 'failure' }});
        console.log(err);
        this.errorObject.serverError = "Something has gone wrong. Please try submitting your feedback again later!";
        this._auth.store("feedbackFormData", formValue);
      }
    )
  }
}