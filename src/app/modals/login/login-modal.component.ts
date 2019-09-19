import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { take } from 'rxjs/operators'

// Project Dependencies
import { ProjectService, SocketService, AuthService } from './../../_services'
import { ProjectStore } from 'src/app/_store';

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
export class LoginModal implements AfterViewInit, OnInit {
  @Output()
  private closeModal: EventEmitter<any> = new EventEmitter()

  @Input()
  private projectId: string

  @Input()
  public loginOnly: boolean

  public guestLogin: boolean = true
  public initialized: boolean

  constructor(
    private projectStore: ProjectStore,
    private _socket: SocketService,
    private _auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    if (this.loginOnly) {
      this.guestLogin = false
    }
  }

  ngAfterViewInit() {
    // Need to give the modal time to load before allowing the clickOutside binding to close the modal
    setTimeout(() => {
      this.initialized = true
    }, 1000)
  }

  onLoginSuccess() {
    if (this.projectId) {
      this.projectStore
        .addUserToProject(this.projectId)
        .pipe(take(1))
        .subscribe(
          () => {
            this.closeModal.emit()
          },
          err => {
            console.error(err)
            this.closeModal.emit()
          },
        )
    } else {
      this.closeModal.emit('preview')
    }
  }

  /**
   * Handles routing to Register page
   */
  public goToRegister() {
    let params = this.route.snapshot.queryParams
    if (params['preview']) {
      this.router.navigate(['/register'], { queryParams: { preview: params['preview'] } })
    } else {
      this.router.navigate(['/register'])
    }
  }

  /**
   * method to allow the modal to close on click outside
   * needs to wait for confirmation on intialization so we don't close it right away when other modals are open
   */
  public closeModalOutside(): void {
    if (this.initialized) {
      if (this.loginOnly) {
        this.closeModal.emit()
      }
    }
  }
}
