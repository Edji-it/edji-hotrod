import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { take } from 'rxjs/operators'

// Project Dependencies
import { SocketService, MessageService } from '../../_services'
import { Reading, User } from '../../shared/datatypes'
import { ProjectStore } from 'src/app/_store';

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

  constructor(private projectStore: ProjectStore) { }

  ngOnInit() { }

  makeCoOwner(student: User): void {
    this.projectStore.makeCoOwner(student).subscribe(
      data => {
        console.log(data)
        this.closeModal.emit()
      },
      err => {
        this.showError = true
      },
    )
  }
}
