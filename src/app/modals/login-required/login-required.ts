import { Component, OnInit, EventEmitter, Output } from '@angular/core'

// Project Dependencies
import { AuthService } from '../../_services'
import { User } from '../../shared/datatypes'

@Component({
  selector: 'hot-login-req',
  templateUrl: 'login-required.html'
})
export class LoginRequiredModal implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter()

  public user: User

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
