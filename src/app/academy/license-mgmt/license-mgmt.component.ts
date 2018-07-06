// library imports
import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'

// project imports
import { User } from '../../shared/datatypes'
import { AuthService, AcademyService } from '../../_services'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ALLSPARK } from '../../app.constants';

@Component({
  selector: 'app-license-mgmt',
  templateUrl: './license-mgmt.component.pug',
  styleUrls: ['./license-mgmt.component.scss']
})
export class LicenseMgmtComponent implements OnInit, OnDestroy {

  public subscriptions: Subscription[] = []

  public user: User
  public license: any
  public currentAcademy: any

  public showLicenseInviteModal: boolean
  public licenseInvite: FormGroup
  
  constructor(
    private _fb: FormBuilder,
    private _auth: AuthService,
    private _academy: AcademyService
  ) { 
    this.licenseInvite = this._fb.group({
      name: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, this.emailValidator])]
    })
  }

  ngOnInit() {
    this.subscriptions.push(
      // Set the current user every time it changes 
      this._auth.getCurrentUser().subscribe((user) => {
        this.user = user
        console.log(user)
      }),
      // get the licenses the user can manage
      this._academy.getLicenses().subscribe((licenses) => {
        this.license = licenses[0]
        console.log(this.license)
      }),
      // get the current academy name
      this._academy.getInstitution(this._academy.currentInstitution).subscribe((academy) => {
        this.currentAcademy = academy.institution
        console.log(this.currentAcademy)
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
    this._academy.inviteToLicense(form.controls.name.value, form.controls.email.value, this.license._id)
    .subscribe(data => {
      let updatedLicense = data.license
      let latestInvitation = updatedLicense.pending_invitations
      // Load the latest pending invitation to the list
      this.license.pending_invitations.push(latestInvitation[latestInvitation.length-1])
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
}
