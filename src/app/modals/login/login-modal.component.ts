import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { take } from 'rxjs/operators'

// Project Dependencies
import { ProjectService, SocketService, AuthService } from './../../_services'

@Component({
  selector: 'hot-login-modal',
  templateUrl: 'login-modal.component.pug',
  styles: [
    `
      .modal-footer {
        flex-direction: column;
      }
    `,
  ],
})
export class LoginModal implements OnInit {
  @Output()
  private closeModal: EventEmitter<any> = new EventEmitter()

  @Input()
  private projectId: string

  @Input()
  private loginOnly: boolean

  public guestLogin: boolean = true

  constructor(private _project: ProjectService, private _socket: SocketService, private _auth: AuthService) {}

  ngOnInit() {
    if (this.loginOnly) {
      this.guestLogin = false
    }
  }

  onLoginSuccess() {
    if (this.projectId) {
      this._project
        .addUserToProject(this.projectId)
        .pipe(take(1))
        .subscribe(
          () => {
            this.closeModal.emit()

            // our socket event takes a bit of user information to setup the event
            let currentUser = this._auth.getUser()
            let username = ''
            let userType = 'temp'
            if (currentUser.type !== 'temp') {
              username = currentUser.username
              userType = 'registered'
            }

            // fire the socket event so the teacher knows we just got another student
            this._socket.groupUpdateEvent({
              type: 'refreshLeaderboard',
              _id: currentUser._id,
              fullname: currentUser.fullname,
              username: username,
              userType: userType,
            })
          },
          err => {
            console.error(err)
            this.closeModal.emit()
          },
        )
    }
  }

  public closeModalOutside(): void {
    if (this.loginOnly) {
      this.closeModal.emit()
    }
  }
}
