import { Component, OnInit } from '@angular/core';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from './../shared/auth.service';

@Component({
  selector: 'edji-register',
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit {
  private registerForm: FormGroup;

  constructor(
    private _auth: AuthService,
    fb: FormBuilder
  ) {
    this.registerForm = fb.group({
      username: [null, Validators.required],
      fullname: [null, Validators.required]
    });
  }

  ngOnInit() { }

  private register(formValue: any) {
    console.log(formValue);
  }
}