import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Output, EventEmitter } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

import { AuthService } from './../../shared';

@Component({
  selector: 'edji-reset-pass',
  templateUrl: 'reset-pass.component.html'
})
export class ResetPassComponent {

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter();

  private passwordForm: FormGroup;
  private responseSuccess: boolean;
  private submissionSuccess: boolean = false;
  private errorObject: any = { };

  constructor(private _auth: AuthService, private angulartics: Angulartics2, fb: FormBuilder) {
    this.passwordForm = fb.group({
      username: [null, Validators.required]
    });
  }

  private onSubmit(formValue: any): void {
    this.clearErrors();

    this.angulartics.eventTrack.next({ action: 'requestPasswordEmail', properties: { category: 'accountManagement', label: 'attempt' }});

    this._auth.recoverPassword( formValue.username )
      .subscribe((success) => {
        if (success) {
          this.angulartics.eventTrack.next({ action: 'requestPasswordEmail', properties: { category: 'accountManagement', label: 'success' }});
          this.submissionSuccess = true;
        } else {
          this.angulartics.eventTrack.next({ action: 'requestPasswordEmail', properties: { category: 'accountManagement', label: 'failure' }});
          this.errorObject.unsuccessful = "We were unable to send the email";
        }
      }, (err) => {
        console.error(err);
      });
  }

  /**
   * Clears all errorObject strings to equal empty strings
   */
  private clearErrors(): void {
    for (let property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = "";
      }
    }
  }
}