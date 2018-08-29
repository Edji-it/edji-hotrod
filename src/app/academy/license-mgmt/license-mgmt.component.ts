// library imports
import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'

// project imports
import { User } from '../../shared/datatypes'
import { AuthService, AcademyService, BumblebeeService } from '../../_services'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ALLSPARK } from '../../app.constants';
import { Angulartics2 } from '../../../../node_modules/angulartics2';
import { take } from '../../../../node_modules/rxjs/operators';

@Component({
  selector: 'app-license-mgmt',
  templateUrl: './license-mgmt.component.pug',
  styleUrls: ['./license-mgmt.component.scss']
})
export class LicenseMgmtComponent implements OnInit, OnDestroy {

  public subscriptions: Subscription[] = []

  public user: User
  public licenseUsers: any = []
  public license: any
  public currentAcademy: any
  public licenseRoles: any = [
    {label: 'Teacher', value: 'teacher'},
    {label: 'Administrator', value: 'administrator'},
  ]
  public licenseUpdateTypes: any = [
    {label: 'Add Licenses', value: 'add licenses'},
    {label: 'Modify Existing License', value: 'update license'},
    {label: 'Update Academy Information', value: 'update academy info'},
    {label: 'Other', value: 'other'}
  ]

  public showLicenseInviteModal: boolean
  public licenseInvite: FormGroup
  public licenseRequest: FormGroup
  public loading: boolean = false

  public errorObject: {
    serverError?: string
  } = {}
  
  constructor(
    private _fb: FormBuilder,
    private _auth: AuthService,
    private _academy: AcademyService,
    private _bumblebee: BumblebeeService,
    private angulartics: Angulartics2
  ) { 
    this.licenseInvite = this._fb.group({
      name: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, this.emailValidator])],
      role: [this.licenseRoles[0].value, null]
    })
    this.licenseRequest = this._fb.group({
      request: [this.licenseUpdateTypes[0].value, null],
      message: [null, Validators.compose([Validators.required])]
    })
  }

  ngOnInit() {
    this.subscriptions.push(
      // Set the current user every time it changes 
      this._auth.getCurrentUser().subscribe((user) => {
        this.user = user
      }),
      // get the licenses the user can manage
      this._academy.getLicenses().subscribe((licenses) => {
        this.license = licenses[0]

        // Set the array lengths here for looping speed
        let activeLicenseLength = this.license.users.length
        let pendLicenseLength = this.license.pending_invitations.length

        // Set up the array with the active licenses
        for (var i=0; i<activeLicenseLength; i++) {
          let licenseUser = this.license.users[i]
          let licenseRoles = this.license.roles
          let licenseUserLicenseIds = this.license.users[i].license_ids
          // Set the Name of educator
          let educatorName = licenseUser.fullname
          // Set the default role of the educator to be 'teacher'
          let educatorRole = 'Teacher'
          for (var j=0; j<licenseRoles.length; j++) {
            // If the educator has a role beyond teacher per the license roles, override it here
            if (licenseRoles[j].user_id===this.user._id) {
              educatorRole = this.capitalizeFirstLetter(licenseRoles[j].role)
            }
          }
          let educatorJoined = new Date
          for (var k=0; k<licenseUserLicenseIds.length; k++) {
            // Set the joined date of the educator for this license
            if (licenseUserLicenseIds.license_id===this.license._id) {
              educatorJoined = licenseUserLicenseIds.joined // | edjidate:'timeStamp':'shortDate'
            }
          }
          // Push the object properties to the license
          this.licenseUsers.push({
            educator: educatorName,
            role: educatorRole,
            joined: educatorJoined,
            type: 'active'
          })
        }

        // Finish up the array with the pending licenses
        for (var i=0; i<pendLicenseLength; i++) {
          let pendingLicense = this.license.pending_invitations[i]
          // Set the Name of educator
          let educatorName = pendingLicense.name
          // Set the default role of the educator to be 'teacher'
          let educatorRole = this.capitalizeFirstLetter(pendingLicense.role) || 'Teacher'
          // Set the joined date to their pending initation expiration date
          let educatorJoined = pendingLicense.expiration
          // Push the object properties to the license
          this.licenseUsers.push({
            educator: educatorName,
            role: educatorRole,
            joined: educatorJoined,
            type: 'pending'
          })
        }
      }),
      // get the current academy name
      this._academy.getInstitution(this._academy.currentInstitution).subscribe((academy) => {
        this.currentAcademy = academy.institution
      })
    )
  }

  /** Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailValidator(control: FormControl): any {
    // If you change the RegExp for the email validator here, change it on the username validator as well
    let emailRe: RegExp = ALLSPARK.EMAILREGEX
    return emailRe.test(control.value) ? null : { 'emailIncorrect': true }
  }

  // Submits the name and email address of the invitation to the teacher
  public formSubmit(form: FormGroup): void {
    this._academy.inviteToLicense(form.controls.name.value, form.controls.email.value, form.controls.role.value, this.license._id)
    .subscribe(data => {
      let updatedLicense = data.license
      let latestInvitation = updatedLicense.pending_invitations[updatedLicense.pending_invitations.length-1]
      // Load the latest pending invitation to the list
      this.licenseUsers.push({
        educator: latestInvitation.name,
        role: this.capitalizeFirstLetter(latestInvitation.role),
        joined: latestInvitation.expiration,
        type: 'pending'
      })
      // Clear the form
      this.licenseInvite.reset()
    },
    (error) => {
      console.error(error)
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  // Since we do this often, we have a method for capitalizing the first letter
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.substr(1,str.length).toLowerCase()
  }

  /** Sends license update/request feedback to bumblebee */
  public sendRequest(formValue: any): void {
    this.loading = true
    this.angulartics.eventTrack.next({ action: 'requestLicense', properties: { category: 'accountManagement', label: 'attempt' }})

    // Only send the user properties we need to bumblebee
    var userSend: any = {
      username: this.user.username,
      fullname: this.user.fullname,
      email: this.user.email,
      hero: this.user.hero
    }

    let formSend = {
      name: userSend.fullname,
      email: userSend.email,
      content: '\nRequest Type: ' + formValue.value.request + '\n\nMessage: ' + formValue.value.message
    }

    let data: any = {
      emailSubject: "License Request",
      formInfo: formSend,
      type: "feedback",
      user: userSend
    }

    this._bumblebee.sendFeedback(data).pipe(take(1)).subscribe(
      (res) => {
        // Clear the form
        this.licenseRequest.reset()
        this.loading = false
        this.angulartics.eventTrack.next({ action: 'requestLicense', properties: { category: 'accountManagement', label: 'success' }})
      },
      (err) => {
        console.error(err)
        this.loading = false
        this.angulartics.eventTrack.next({ action: 'requestLicense', properties: { category: 'accountManagement', label: 'failure' }})
        this.errorObject.serverError = "Something has gone wrong. Please try submitting your feedback again later!"
      }
    )
  }
}
