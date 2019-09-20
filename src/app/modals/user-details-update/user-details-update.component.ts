import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { take } from 'rxjs/operators'

import { User } from './../../shared/datatypes'
import { AuthService, BumblebeeService } from './../../_services'

@Component({
  selector: 'hot-user-details-update',
  templateUrl: './user-details-update.component.pug',
  styleUrls: ['user-details-update.component.scss'],
})
export class UserDetailsUpdateModal implements OnInit {
  private _showModal: boolean
  @Input()
  set showModal(show) {
    if (show) {
      this.refreshDisplayValues()
    }
    this._showModal = show
  }
  get showModal(): boolean {
    return this._showModal
  }
  @Output() closeModal: EventEmitter<any> = new EventEmitter()
  @ViewChild('schoolInput', { static: false }) input: ElementRef

  private currentUser: User
  private heardFromForm: FormGroup
  private existingUser: boolean

  private messages: {
    success?: boolean
    serviceError?: boolean
  } = {}

  public modalHeadings: {
    header: string
    body: string
  } = {
      header: ':tada: Hooray! Another Teacher!',
      body: 'We are excited to have you. One more question, and we will leave you to the teaching.',
    }

  public sourceOptions: { source: string, display: string }[] = [
    { source: 'friend', display: 'Friend or colleague' },
    { source: 'twitter', display: 'Twitter' },
    { source: 'facebook', display: 'Facebook' },
    { source: 'avid', display: 'AVID training' },
    { source: 'podcast', display: 'Podcast' },
    { source: 'blog', display: 'Blog article' },
    { source: 'pd', display: 'Professional development' },
    { source: 'edcamp', display: 'EdCamp' },
    { source: 'conference', display: 'Conference' },
    { source: 'other', display: 'Other' }
  ]

  constructor(
    private _auth: AuthService,
    private _bumble: BumblebeeService,
    _fb: FormBuilder,
  ) {
    this.heardFromForm = _fb.group({
      source: [null, Validators.required],
      detail: [null]
    })
  }

  ngOnInit() {
    this.refreshDisplayValues()
  }

  private refreshDisplayValues() {
    this.currentUser = this._auth.getUser()
    // If not teacher, display generic copy
    if (this.currentUser.identities && !this.currentUser.identities.includes('teacher')) {
      this.modalHeadings = {
        header: ':tada: Welcome to Edji!',
        body: 'We are happy to have you, one more question and you\'ll be on your way.'
      }
    }
    // Check if their account was created today
    let createdDate = new Date(this.currentUser.createdAt).setHours(0, 0, 0, 0)
    let todaysDate = new Date().setHours(0, 0, 0, 0)
    if (createdDate != todaysDate) {
      this.existingUser = true
    }
  }

  /**
   * Submits and closes modal on completion
   * @param form 
   */
  private formSubmit(form: FormGroup): void {
    let detail = form.value.detail

    if (!detail) {
      let selectedSource = this.sourceOptions.find(option => {
        return option.source == form.value.source
      })
      detail = selectedSource.display
    }

    let heard_from = {
      source: form.value.source,
      detail: detail
    }

    this._auth
      .updateUser({ heard_about_us: heard_from })
      .pipe(take(1))
      .subscribe(
        (res: any) => {
          this._auth.setUser(res.user)
          this.messages.success = true
          // Close the modal
          this.closeModal.emit()
          // Currently assuming only teachers are entering details
          // Tell Bumblebee/Slack!
          if (this.existingUser) {
            this._bumble.sendUserDetails(res.user, 'additionalDetails')
          } else {
            this._bumble.sendUserDetails(res.user)
          }
        },
        err => {
          console.error(err)
        },
      )
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
}
