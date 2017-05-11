import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

import { ProjectService } from './../../shared'

@Component({
  selector: 'hot-login-modal',
  templateUrl: 'login-modal.component.html',
  styles: [`
    .modal-footer { flex-direction: column }
  `]
})
export class LoginModal implements OnInit {

  @Output()
  private closeModal: EventEmitter<any> = new EventEmitter()

  @Input()
  private projectId: string

  private guestLogin: boolean = true

  constructor(
    private _project: ProjectService
  ) { }

  ngOnInit() {
  }

  onLoginSuccess() {
    this._project.addUserToProject(this.projectId)
      .take(1)
      .subscribe(() => {
        this.closeModal.emit()
      }, (err) => {
        console.error(err)
        this.closeModal.emit()
      })
  }
}