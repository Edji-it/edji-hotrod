import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { take } from 'rxjs/operators'

import { User } from './../../shared/datatypes'
import { AuthService, BumblebeeService } from './../../_services'

@Component({
  selector: 'hot-user-update-modal',
  templateUrl: './user-update.component.pug',
  styleUrls: ['user-update.component.scss'],
})
export class UserUpdateModal implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter()

  public messages: {
    success?: boolean
    serviceError?: boolean
  } = {}

  constructor(private _auth: AuthService) {}

  ngOnInit() {}
}
