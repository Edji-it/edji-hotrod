import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
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

  constructor(private _auth: AuthService, _fb: FormBuilder) {}

  ngOnInit() {}

  /**
   * Submits and closes modal on completion
   * @param form
   */
  public formSubmit(form: FormGroup): void {
    let detail = form.value.detail

    let updateUser = {}
    console.log(updateUser)

    // this._auth
    //   .updateUser(updateUser)
    //   .pipe(take(1))
    //   .subscribe(
    //     (res: any) => {
    //       this._auth.setUser(res.user)
    //       this.messages.success = true
    //       // Close the modal
    //       this.closeModal.emit()
    //     },
    //     err => {
    //       console.error(err)
    //     },
    //   )
  }
}
