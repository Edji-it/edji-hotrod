import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { take, debounceTime, map } from 'rxjs/operators'

import { User } from './../../shared/datatypes'
import { AuthService, BumblebeeService, AcademyService, MailchimpService } from './../../_services'
import { ALLSPARK } from 'src/app/app.constants'
import { fromEvent } from 'rxjs'

@Component({
  selector: 'hot-user-details-update',
  templateUrl: './user-details-update.component.pug'
})

export class UserDetailsUpdateModal implements OnInit {
  @Input() showModal: boolean
  @Output() closeModal: EventEmitter<any> = new EventEmitter()

  @ViewChild('schoolInput') input: ElementRef

  private currentUser: User
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
  public identitySelect: boolean = true
  private existingUser: boolean

  private messages: {
    success?: boolean,
    serviceError?: boolean
  } = {}

  public modalHeadings: {
    header: string,
    body: string
  } = {
      header: 'Before you begin',
      body: 'Help us customize your experience. Are you a...'
    }

  constructor(
    private _academy: AcademyService,
    private _auth: AuthService,
    private _bumble: BumblebeeService,
    private _chimp: MailchimpService,
    _fb: FormBuilder
  ) {
    this.userDetailsForm = _fb.group({
      school: [null, Validators.required],
      phone: [null, [Validators.required, this.phoneNumberValidator]],
      sales_can_contact: null,
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
    this.currentUser = this._auth.getUser()

    if (
      (this.currentUser && this.currentUser.identities && this.currentUser.identities.includes('teacher')) ||
      (this.currentUser && this.currentUser.identities && this.currentUser.identities.includes('administrator')) &&
      this.currentUser && !this.currentUser.school_district.district_name
    ) {
      this.existingUser = true
      this.setFormIdentities(this.currentUser)
      this.showTeacherForm()
    }
  }

  public formSubmit(form: FormGroup): void {
    // if the user identifies as a teacher or admin, we need to switch to the next section to collect school name and phone number (optional)
    if ((form.value.identities.teacher || form.value.identities.administrator) && form.value.school === null) {
      this.showTeacherForm()
    } else {
      // update the user if we have the info we need
      this.processIdentities(form)
    }
  }

  private processIdentities(form: FormGroup): void {
    let identities = []
    for (let field in form.value.identities) {
      if (form.value.identities[field]) {
        identities.push(field) // the name of the field gets added to the array, making it important to name the fields properly
      }
    }

    // Set school and phone if we have it
    let schoolInfo: schoolDistrict
    let phone = ''
    let contactMe = false
    if (form.value.school) {
      // set the school and district data here
      schoolInfo = {
        school_name: form.value.school || '',
        school_id: form.value.school || '',
        district_name: form.value.school,
        district_id: form.value.school || ''
      }
    }
    if (form.value.phone) {
      phone = form.value.phone
    }
    if (form.value.sales_can_contact) {
      contactMe = form.value.sales_can_contact
    }

    this._auth.updateUser({ identities: identities, school_district: schoolInfo, phone_number: phone, sales_can_contact: contactMe })
      .pipe(take(1))
      .subscribe((res: any) => {
        this._auth.setUser(res.user)
        this.messages.success = true
        // Close the modal
        this.closeModal.emit()
        // If we have a teacher, send it to Mailchimp and Bumblebee/Slack
        if (res.user.identities && res.user.identities.indexOf('teacher') > -1 || res.user.identities.indexOf('administrator') > -1) {
          // Tell Bumblebee/Slack!
          res.user.phone_number = phone
          if (this.existingUser) {
            this._bumble.sendUserDetails(res.user, 'additionalDetails')
          } else {
            this._bumble.sendUserDetails(res.user)
          }
          this._chimp.addToNewUsersList(res.user)
          // send the data to Pipo to track registrations if they are a teacher
          this._academy.pipoEvent({
            // standard event info:
            event_name: "registration",
            user_id: res.user._id,
            teacher: true,
            hero: res.user.hero_status || false,
            institution_id: res.user.institution_ids || []
          })
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
    for (let control in group.controls) {
      if (group.controls[control].value === true) {
        valid = true
      }
    }
    return valid ? null : { identity: true }
  }

  /**
   * Validates the phone number is in the correct reg expression if one is entered
   * @param control is our form control 
   */
  private phoneNumberValidator(control: FormControl): any {
    if (!control.value) {
      return null
    }
    // Run the check agains the phone validator
    let phoneRe: RegExp = ALLSPARK.PHONEREGEX
    return phoneRe.test(control.value) ? null : { 'phoneIncorrect': true }
  }

  /**
   * If we're prompting the user to add secondary properties like school district and phone number, 
   * we need to set the identities to their current values so we don't overwrite them
   * @param user current user
   */
  private setFormIdentities(user: User) {
    for (let control in this.userDetailsForm.value.identities) {
      if (user.identities.includes(control)) {
        this.userDetailsForm.controls.identities['controls'][control].setValue(true)
      } else {
        this.userDetailsForm.controls.identities['controls'][control].setValue(null)
      }
    }
  }

  /**
   * Disply teacher specific form and copy
   */
  private showTeacherForm(): void {
    this.modalHeadings.header = 'Welcome Teacher!'
    this.modalHeadings.body = 'We\'re honored to have you. Where do you teach?'
    this.identitySelect = false

    setTimeout(() => {
      const example = fromEvent(this.input.nativeElement, 'keyup').pipe(map(i => i))
      const debouncedInput = example.pipe(debounceTime(500))
      const subscribe = debouncedInput.subscribe(val => {
        // search for schools here
        console.log(this.userDetailsForm.value.school)
      })
    }, 1)
  }
}

interface schoolDistrict {
  school_id: string
  school_name: string
  district_id: string
  district_name: string
}