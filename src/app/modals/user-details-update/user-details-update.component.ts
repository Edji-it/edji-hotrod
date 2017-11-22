import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { setTimeout } from 'timers';

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

  constructor(
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
      })
    })
  }

  ngOnInit() {
  }

  private formSubmit(form: FormGroup) {

  }
}