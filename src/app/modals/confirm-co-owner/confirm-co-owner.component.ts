import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { take } from 'rxjs/operators'

// Project Dependencies
import { ProjectService } from '../../_services'
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

  constructor(private _projects: ProjectService) {}

  ngOnInit() {}

  makeCoOwner(student: User): void {
    // this._projects.makeCoOwner(student)
    //   .subscribe(
    //     data => {
    //       this.closeModal.emit()
    //     },
    //     err => {
    //       this.showError = true
    //     },
    // )
  }
}
