// library imports
import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'

// project imports
import { User } from '../../shared/datatypes'
import { AuthService, AcademyService, BumblebeeService, AcademyState } from '../../_services'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import { ALLSPARK } from '../../app.constants'
import { Angulartics2 } from '../../../../node_modules/angulartics2'
import { take } from '../../../../node_modules/rxjs/operators'

@Component({
  selector: 'app-license-mgmt',
  templateUrl: './license-mgmt.component.pug',
  styleUrls: ['./license-mgmt.component.scss'],
})
export class LicenseMgmtComponent implements OnInit, OnDestroy {
  public subscriptions: Subscription[] = []

  public user: User
  public academyState: AcademyState
  public licenseUsers: LicenseRow[] = []
  public license: any
  // Hold on to loaded licenses
  private licenses: any[]
  public currentAcademy: any
  public licenseRoles: any = [
    { label: 'Teacher', value: 'teacher' },
    { label: 'Administrator', value: 'administrator' },
  ]
  public licenseUpdateTypes: any = [
    { label: 'Add Licenses', value: 'add licenses' },
    { label: 'Modify Existing License', value: 'update license' },
    { label: 'Update Academy Information', value: 'update academy info' },
    { label: 'Other', value: 'other' },
  ]

  public inviteLink: string = ''
  public showLicenseInviteModal: boolean
  public licenseInvite: FormGroup
  public inviteSuccess: {
    sent?: boolean
    resent?: boolean
  } = {}
  public inviteError: {
    server?: boolean
  } = {}
  public licenseRequest: FormGroup
  public licenseRequestSent: boolean
  public loading: boolean = false
  public today: Date

  public errorObject: {
    serverError?: string
  } = {}

  constructor(
    private _fb: FormBuilder,
    private _auth: AuthService,
    private _academy: AcademyService,
    private _bumblebee: BumblebeeService,
    private angulartics: Angulartics2,
  ) {
    this.today = new Date()
    this.licenseInvite = this._fb.group({
      name: [null, Validators.required],
      email: [null, [Validators.required, this.emailValidator]],
      role: [this.licenseRoles[0].value, null],
    })
    this.licenseRequest = this._fb.group({
      request: [this.licenseUpdateTypes[0].value, null],
      message: [null, [Validators.required]],
    })
  }

  ngOnInit() {
    this.subscriptions.push(
      // Set the current user every time it changes
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
      }),
      // Know when user swaps between academies
      this._auth.currentAcademyState.subscribe(currentState => {
        this.academyState = currentState
        if (this.licenses && this.academyState && this.academyState.selected) {
          this.loadLicenseRows(this.licenses[this.academyState.selected])
        }
      }),
      // get the licenses the user can manage
      this._academy.getLicenses().subscribe(licenses => {
        let licenseIndex = this.academyState.selected || 0
        this.licenses = licenses
        this.loadLicenseRows(this.licenses[licenseIndex])
        // Set invite link to first hero license
        let heroLicenses = licenses.filter(license => { return license.license_type === 'hero' })
        this.inviteLink = this.buildLicenseLink(heroLicenses[0])
      }),
    )
  }

  /**
   * Process license data for display
   * @param activeLicense license for active academy
   */
  private loadLicenseRows(activeLicense: any): void {
    this.license = activeLicense
    this.licenseUsers = []
    // Get the current academy name
    this.currentAcademy = this.license['owning_institution']
    // Set the array lengths here for looping speed
    let activeLicenseLength = this.license.users.length
    let pendLicenseLength = this.license.pending_invitations.length

    // Set up the array with the active licenses
    for (var i = 0; i < activeLicenseLength; i++) {
      let licenseUser = this.license.users[i]
      let licenseRoles = this.license.roles
      let userLicenseIds = licenseUser.license_ids
      // Set the default role of the educator to be 'teacher'
      let educatorRole = 'Teacher'
      for (var j = 0; j < licenseRoles.length; j++) {
        // If the educator has a role beyond teacher per the license roles, override it here
        if (licenseRoles[j].user_id === licenseUser._id) {
          educatorRole = this.capitalizeFirstLetter(licenseRoles[j].role)
        }
      }
      let educatorJoined: Date
      for (var k = 0; k < userLicenseIds.length; k++) {
        // Set the joined date of the educator for this license
        if (userLicenseIds[k].license_id === this.license._id) {
          educatorJoined = userLicenseIds[k].joined
        }
      }
      // Push the object properties to the license
      this.licenseUsers.push({
        educator: licenseUser.fullname,
        email: licenseUser.email,
        role: educatorRole,
        joined: educatorJoined,
        type: 'active',
      })
    }

    // Finish up the array with the pending licenses
    for (var i = 0; i < pendLicenseLength; i++) {
      let pendingLicense = this.license.pending_invitations[i]
      // Set the default role of the educator to be 'teacher'
      let educatorRole = this.capitalizeFirstLetter(pendingLicense.role) || 'Teacher'
      // Set type: 'pending' can also be 'expired'
      let inviteType = this.today > new Date(pendingLicense.expiration) ? 'expired' : 'pending'
      // Push the object properties to the license
      this.licenseUsers.push({
        // Set the Name of educator
        educator: pendingLicense.name,
        email: pendingLicense.email,
        role: educatorRole,
        // Set the joined date to their pending initation expiration date
        joined: pendingLicense.expiration,
        type: inviteType,
      })
    }
  }

  /**
   * Generate academy invite link
   * @param license hero license to use for link
   */
  private buildLicenseLink(license): string {
    if (license.link_tokens && license.owning_institution) {
      let name = encodeURIComponent(license.owning_institution.name)
      let token = license.link_tokens
      return `${location.origin}/#/license/accept/${token}?academy=${name}&tokenType=academy_token`
    } else {
      console.error("License Link: Unable to find link token on license")
      return ''
    }
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    // If you change the RegExp for the email validator here, change it on the username validator as well
    let emailRe: RegExp = ALLSPARK.EMAILREGEX
    return emailRe.test(control.value) ? null : { emailIncorrect: true }
  }

  // Submits the name and email address of the invitation to the teacher
  public formSubmit(form: FormGroup): void {
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action: 'academy_' + form.controls.role.value + '_invite',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    // Check if user has already been invited
    let existingInvite: LicenseRow
    let invitedEmail = form.controls.email.value
    let licenseUsersLength = this.licenseUsers.length
    // Reset form errors
    this.inviteError = {}
    for (let i = 0; i < licenseUsersLength; i++) {
      if (this.licenseUsers[i].email === invitedEmail) {
        existingInvite = this.licenseUsers[i]
      }
    }

    if (existingInvite) {
      // Re-send request
      this.resendInvite(existingInvite)
    } else {
      this._academy
        .inviteToLicense(
          form.controls.name.value,
          form.controls.email.value,
          form.controls.role.value,
          this.license._id,
        )
        .subscribe(
          data => {
            let updatedLicense = data.license
            let latestInvitation = updatedLicense.pending_invitations[updatedLicense.pending_invitations.length - 1]
            // Load the latest pending invitation to the list
            this.licenseUsers.push({
              educator: latestInvitation.name,
              email: latestInvitation.email,
              role: this.capitalizeFirstLetter(latestInvitation.role),
              joined: latestInvitation.expiration,
              type: 'pending',
            })
            // Clear the form
            this.licenseInvite.reset({ role: this.licenseRoles[0].value })
            // Show success message
            this.inviteSuccess.sent = true
            setTimeout(() => {
              this.inviteSuccess = {}
            }, 4000)
          },
          error => {
            console.error(error)
            this.inviteError.server = true
          },
        )
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  // Since we do this often, we have a method for capitalizing the first letter
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.substr(1, str.length).toLowerCase()
  }

  /** Sends license update/request feedback to bumblebee */
  public sendRequest(formValue: any): void {
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action: 'academy_' + formValue.value.request + '_request',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    this.loading = true

    // Only send the user properties we need to bumblebee
    var userSend: any = {
      username: this.user.username,
      fullname: this.user.fullname,
      email: this.user.email,
      hero: this.user.hero_status,
    }

    let formSend = {
      name: userSend.fullname,
      email: userSend.email,
      content: '\nRequest Type: ' + formValue.value.request + '\n\nMessage: ' + formValue.value.message,
    }

    let data: any = {
      emailSubject: 'License Request',
      formInfo: formSend,
      type: 'feedback',
      user: userSend,
    }

    this._bumblebee
      .sendFeedback(data)
      .pipe(take(1))
      .subscribe(
        res => {
          this.licenseRequestSent = true
          setTimeout(() => {
            this.licenseRequestSent = false
          }, 4000)
          // Clear the form
          this.licenseRequest.reset()
          this.loading = false
        },
        err => {
          console.error(err)
          this.loading = false
          this.errorObject.serverError = 'Something has gone wrong. Please try submitting your feedback again later!'
        },
      )
  }

  /**
   * Send pending user another invite
   * @param license Pending license object
   */
  private resendInvite(invite: LicenseRow): void {
    this.inviteError = {}
    this._academy.inviteToLicense(invite.educator, invite.email, invite.role, this.license._id).subscribe(
      data => {
        // Update the expired license
        invite.type = 'pending'
        invite.joined = new Date(Date.now() + 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 14)
        // Clear the form (resent is used when email address matches existing)
        this.licenseInvite.reset({ role: this.licenseRoles[0].value })
        // Show success message
        this.inviteSuccess.resent = true
        setTimeout(() => {
          this.inviteSuccess = {}
        }, 4000)
      },
      error => {
        console.error(error)
        this.inviteError.server = true
      },
    )
  }
}

interface LicenseRow {
  educator: string
  email: string
  role: string
  joined: Date
  type: string
}
