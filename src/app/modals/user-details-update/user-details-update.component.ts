import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { take } from 'rxjs/operators'

import { User } from './../../shared/datatypes'
import { AuthService, BumblebeeService } from './../../_services'

@Component({
  selector: 'hot-user-details-update',
  templateUrl: './user-details-update.component.pug'
})

export class UserDetailsUpdateModal implements OnInit {
  @Input() showModal: boolean
  @Output() closeModal: EventEmitter<any> = new EventEmitter()

  private userDetailsForm: FormGroup
  private identities: {
    name: string
    id: string
    checkboxCopy: string
  }[] = [
    { name: 'student', id: 'typeStudentInput', checkboxCopy: "Student :writing_hand:" },
    { name: 'teacher', id: 'typeTeacherInput', checkboxCopy: "Teacher :apple:" },
    { name: 'administrator', id: 'typeAdministratorInput', checkboxCopy: "Tech Coach/Administrator :clipboard:" },
    { name: 'business', id: 'typeBusinessInput', checkboxCopy: "Business Application :briefcase:" },
    { name: 'personal', id: 'typePersonalInput', checkboxCopy: "Personal Reading Platform :books:" },
    { name: 'robot', id: 'typeRobotInput', checkboxCopy: "I'm a robot. :robot_face:" },
    { name: 'other', id: 'typeOtherInput', checkboxCopy: "Other :sparkles:" }
  ]

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
        administrator: null,
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
      .pipe(take(1))
      .subscribe((res: any) => {
        this._auth.setUser(res.user)
        this.messages.success = true
        // Close the modal
        this.closeModal.emit()
        if (this._auth.getEnv() === "prod") { 
          // If we have a teacher, send it to Mailchimp and Bumblebee/Slack
          if(res.user.identities && res.user.identities.indexOf('teacher') > -1 || res.user.identities.indexOf('administrator') > -1) {
            // Tell Bumblebee/Slack!
            this._bumble.sendUserDetails(res.user)
            // Parse fullname for Mailchimp
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
}