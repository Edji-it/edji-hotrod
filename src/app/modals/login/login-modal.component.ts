import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'hot-login-modal',
  templateUrl: 'login-modal.component.html',
  styles: [`
    .modal-footer { flex-direction: column; }
  `]
})
export class LoginModal implements OnInit {

  @Output()
  private closeModal: EventEmitter<any> = new EventEmitter();

  private guestLogin: boolean = true;

  constructor() { }

  ngOnInit() {

  }
}