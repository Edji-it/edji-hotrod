import { Component, OnInit, EventEmitter, Output } from '@angular/core'

import { AuthService } from '../../shared'
import { User } from '../../shared/datatypes'

@Component({
  selector: 'got-login-req',
  templateUrl: 'login-required.html'
})
export class LoginRequiredModal implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter()

  private user: User

  constructor(
    private _auth: AuthService
  ) {}

  ngOnInit() {
    this._auth.getCurrentUser().subscribe((user) => {
      this.user = user
    }, (err) => {
      console.error(err)
    })
  }
}