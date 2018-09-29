import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { take } from 'rxjs/operators'

// Project Dependencies
import { ProjectService } from './../../_services'

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

  public guestLogin: boolean = true

  constructor(
    private _project: ProjectService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
  }

  onLoginSuccess() {
    this._project.addUserToProject(this.projectId)
      .pipe(take(1))
      .subscribe(() => {
        this.closeModal.emit()
        console.log(' added user to project ')
      }, (err) => {
        console.error(err)
        this.closeModal.emit()
      })
  }
}