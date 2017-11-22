import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'hot-user-details-update',
  templateUrl: 'user-details-update.component.pug'
})

export class UserDetailsUpdateModal implements OnInit {
  @Input() showModal: boolean
  @Output() closeModal: EventEmitter<any> = new EventEmitter()

  constructor(
  ) {  }

  ngOnInit() {  }
}