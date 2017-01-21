import { Component } from '@angular/core';
import { PRIMARY_OUTLET, Router } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Angulartics2 } from 'angulartics2';

import { AuthService, BumblebeeService } from './../shared';

@Component({
  selector: 'edji-register',
  templateUrl: 'register.component.html',
  styles: [`
    .btn-group-wrapper {
      width: 100%;
      text-align: center;
    }

    .btn-group-wrapper label {
      margin: 0;
    }

    label.btn.btn-primary.active {
      border: 3px solid #4A92BC;
    }
  `]
})
export class RegisterComponent {
  private registerForm: FormGroup;
  private registerLoading: boolean = false;
  private errorObject: any = {
    duplicateUser: "",
    serverError: "",
    badName: ""
  };

  constructor(
    private _auth: AuthService,
    private router: Router,
    private angulartics: Angulartics2,
    private bumblebee: BumblebeeService,
    fb: FormBuilder
  ) {
    // this makes the window always render scrolled to the top
    this.router.events.subscribe(() => {
      window.scrollTo(0, 0);
    });

    this.registerForm = fb.group({
      username: [null, Validators.required],
      fullname: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, this.emailValidator])],
      isTeacher: ["false"],
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
    this.clearErrors();

    this.angulartics.eventTrack.next({ action: 'registerMain', properties: { category: 'login', label: 'attempt' }});

    this.registerLoading = true;

    this._auth.register(formValue)
      .take(1)
      .subscribe((data) => {
        this.registerLoading = false;
        if (data.user) {
          if (data.user.isTeacher && this._auth.getEnv() === "prod") { this.bumblebee.sendUserDetails(data.user); }
          this.angulartics.eventTrack.next({ action: 'registerMain', properties: { category: 'login', label: 'success' }});
          this.router.navigate(['dashboard']);
        } else {
          // TRACK EXCEPTION... there was no data
        }
      }, (err) => {
        this.registerLoading = false;

        switch (err.status) {
          case 406:
            let error = err.json() || {};
            if (error.validationErrors) {
              let errorCaught: boolean = false;
              if (error.validationErrors.fullname === "badWords") {
                this.errorObject.badName = ":anguished: Would you mind choosing another name?";
                errorCaught = true;
              } 
              if (error.validationErrors.username === "badWords") {
                this.errorObject.badUsername = ":anguished: Would you mind choosing another username?";
                errorCaught = true;
              }
              if (!errorCaught) {
                this.angulartics.eventTrack.next({ action: 'registerMain', properties: { category: 'login', label: 'failure' }});
                // form validation should have caught any other errors
              }
            }
            break;
          case 409:
            this.errorObject.duplicateUser = "<strong>Wow!</strong> :grin: Somebody else liked your username so much that they already took it."; break;
          default:
            this.angulartics.eventTrack.next({ action: 'registerMain', properties: { category: 'login', label: 'failure' }});
            console.log(err);
        }
      });
  }

  /**
   * Clears all errorObject strings to equal empty strings
   */
  private clearErrors(): void {
    for (let property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = null;
      }
    }
  }
}