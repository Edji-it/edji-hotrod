import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { take } from 'rxjs/operators'

// Project Dependencies
import { ProjectService, SocketService, MessageService } from '../../_services'
import { Reading, User } from '../../shared/datatypes'

@Component({
  selector: 'edji-confirm-co-owner',
  templateUrl: './confirm-co-owner.component.pug',
})
export class ConfirmCoOwnerModal implements OnInit {
  @Output()
  closeModal: EventEmitter<any> = new EventEmitter()
  @Output()
  deleteReading: EventEmitter<any> = new EventEmitter()
  @Input()
  student: User

  public showError: boolean = false

  constructor(private _projects: ProjectService, private _socket: SocketService, private _messages: MessageService) {}

  ngOnInit() {}

  makeCoOwner(student: User): void {
    this._projects.makeCoOwner(student).subscribe(
      data => {
        // Push update to notify user
        this._socket.groupUpdateEvent({
          type: 'coteacherPromote',
          user: student,
        })
        // Display confirmation toast
        this._messages.sendToast({
          id: 'coteacherPromoted',
          type: 'promoted',
          message: '<b>' + student.fullname + '</b> has been promoted to co-teacher',
        })
        console.log(data)
        this.closeModal.emit()
      },
      err => {
        this.showError = true
      },
    )
  }
}
