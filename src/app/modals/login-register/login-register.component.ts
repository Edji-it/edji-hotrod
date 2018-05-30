import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

// Project Dependencies
import { ProjectService } from './../../_services'

@Component({
  selector: 'hot-login-register',
  templateUrl: './login-register.component.pug',
  styles: [`
    .modal-footer { flex-direction: column }
  `]
})
export class LoginRegisterModal implements OnInit {

  @Input()
  public loginHeader: string

  @Output()
  public closeModal: EventEmitter<any> = new EventEmitter()

  @Output()
  public loginSuccess: EventEmitter<any> = new EventEmitter()

  constructor(
    private _project: ProjectService
  ) { }

  ngOnInit() {
    if (!this.loginHeader) {
      this.loginHeader = 'Please log in or register to continue.'
    }
  }
  
}