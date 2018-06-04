import { Component, OnInit } from '@angular/core'

// Project Dependencies
import { AuthService } from '../../_services'

@Component({
  selector: 'hot-register-form',
  templateUrl: './register.component.pug',
  styleUrls: ['./register.component.scss']
})
export class RegisterFormComponent implements OnInit {

  constructor(
    private _auth: AuthService,
    private _project: ProjectService,
    private angulartics: Angulartics2,
    private _fb: FormBuilder,
    private _title: Title,
    private _locker: LockerService
  ) {
    this.userCopy = new Copy().getUserCopy()

    this.registerForm = _fb.group({
      username: [null, Validators.compose([Validators.required, this.usernameValidator])],
      fullname: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, this.emailValidator])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(6)])],
      passwordConfirm: [null, Validators.required],
    }, { validator: this.passwordsEqual })
  }

  ngOnInit() {
  }

}
