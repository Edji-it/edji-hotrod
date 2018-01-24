import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { setTimeout } from 'timers'

import { User } from './../../shared/datatypes'
import { AuthService, BumblebeeService } from './../../shared'

@Component({
  selector: 'hot-user-details-update',
  templateUrl: 'user-details-update.component.pug'
})

export class UserDetailsUpdateModal implements OnInit {
  @Input() showModal: boolean
  @Output() closeModal: EventEmitter<any> = new EventEmitter()

  private userDetailsForm: FormGroup
  private checkboxCopy = {
    student: "As a student! :writing_hand:",
    teacher: "As a teacher! :apple:",
    business: "For business. :briefcase:",
    personal: "My own reading and sharing :books:",
    robot: "I'm a robot. :robot_face:",
    other: "Some reason we haven't listed here! :sparkles:"
  }
  private messages: {
    success?: boolean,
    serviceError?: boolean
  } = {}

  constructor(
    private _auth: AuthService,
    private _bumble: BumblebeeService,
    _fb: FormBuilder
  ) { 
    this.userDetailsForm = _fb.group({
      identities: _fb.group({
        student: true,
        teacher: null,
        business: null,
        personal: null,
        robot: null,
        other: null
      }, { validator: this.checkboxValidator })
    })
  }

  ngOnInit() {
  }

  private formSubmit(form: FormGroup): void {
    let user: User = this._auth.getUser()

    let identities = []
    for(let field in form.value.identities) {
      if (form.value.identities[field]) {
        identities.push(field) // the name of the field gets added to the array, making it important to name the fields properly
      }
    }

    this._auth.updateUser({identities: identities})
      .take(1)
      .subscribe((res) => {
        this._auth.setUser(res.user)
        this._bumble.sendUserDetails(res.user)
        this.messages.success = true
        this.triggerCloseTimeout()
        if (this._auth.getEnv() === "prod") { 
          if(res.user.identities && res.user.identities.indexOf('teacher') > -1) {
            let nameArr = res.user.fullname.split(" ")
            let fname = nameArr[0]
            let lname = nameArr[1]
            this._auth.addToNewUsersList({ 'email' : res.user.email, 'fname' : fname, 'lname' : lname })
          }
        }
      }, (err) => {
        console.error(err)
      })
  }

  /**
   * Validates that at least one checkbox is checked, and assigns error if not
   * @returns error to FormGroup called 'identity'
   */
  private checkboxValidator(group: FormGroup): any {
    let valid = false
    for(let control in group.controls) {
      if (group.controls[control].value === true) {
        valid = true
      }
    }
    return valid ? null : { identity: true }
  }

  /** Triggers the timeout which closes the modal */
  private triggerCloseTimeout(): void {
    setTimeout(() => {
      this.closeModal.emit()
    }, 3000)
  }
}