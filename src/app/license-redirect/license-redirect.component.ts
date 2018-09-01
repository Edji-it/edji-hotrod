import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators';

// Project dependancies
import { User } from '../shared/datatypes'
import { LockerService, AuthService, AcademyService, UtilToolService } from '../_services'

@Component({
  selector: 'app-license-redirect',
  templateUrl: './license-redirect.component.pug',
  styleUrls: ['./license-redirect.component.scss']
})
export class LicenseRedirectComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []
  public login: boolean = true

  public user: User
  public licenseId: string

  public messages: {
    licenseProcessError?: boolean,
    invalidLicense?: boolean,
    serverError?: boolean
  } = {}

  constructor(
    private _auth: AuthService,
    private route: ActivatedRoute,
    private _router: Router,
    private _locker: LockerService,
    private _academy: AcademyService,
    public _util: UtilToolService
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe((user) => {
          this.user = user
      })
    )

    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        this.licenseId = params['license_id']
      })
    )

    /** 
     * if the license_id is defined and passed in properly through the query param on the route, 
     * let's add it to the locker and then move to the login/register check
     */ 
    if (typeof(this.licenseId)!='undefined' && this.licenseId!='') {
      // if the user is logged in already, then we'll process the license
      if (this.user.isLoggedIn) {
        // if the user already accepted this license, redirect them to the dashboard.. otherwise process it
        if (this.user.license_ids.includes(this.licenseId) && this.user.hero_status) {
          this._router.navigate(['/dashboard'])
        } else {
          this.processLicense()
        }
      } else {
        // store the licenseId in the locker if we need to register the user or they need to login
        this._locker.set("licenseId", this.licenseId)
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }

  /**
   * Tells the server we have a license to add to the user account
   * If coming from oauth or any other case where we have a licenseId on here, let's clear it from the locker
   */
  processLicense() {
    // if licenseId is in the locker let's take it out
    if (this._locker.has('licenseId')) {
      this._locker.remove('licenseId')
    }
    // tell the server we need to process the license on the user
    this._academy.acceptLicense(this.licenseId).pipe(take(1)).subscribe((userWithLicense: any) => {
      // update the user across the app with the new license ID and hero status update
      this._auth.refreshUser().pipe(take(1)).subscribe((updatedUser: any) => {
        if (this.findLicense(updatedUser.license_ids, this.licenseId)>-1 && updatedUser.hero_status) {
          let index = updatedUser.institution_ids.length - 1
          let institutionId = updatedUser.institution_ids[index]
          // once we update the user to add a license and make them a hero, let's redirect them to the dashboard
          this._router.navigate(['/license/welcome/' + institutionId])
        } else {
          // error handling if the license was not processed on their account
          this.messages.licenseProcessError = true
        }
      })
    }, (err) => {
      console.error(err)
      if (err.status===403 && err.error.error === 'invite not found for email') {
        this.messages.serverError = true
      }
      if (err.status===403 && err.error.error === 'invalid license') {
        this.messages.invalidLicense = true
      }
    })
  }

  /**
   * Checks for the license on the user object since it is an array of objects including licnese_id and joined date
   * @param userLicenses the licenses on the user object, which is an array of licenses
   * @param license_id the license we are looking to confirm is on the user object
   */
  private findLicense(userLicenses, license_id) {
    let arrLength = userLicenses.length
    for (var i=0; i<arrLength; i++) {
      if(userLicenses[i].license_id===license_id) {
        console.log(i)
        return i
      }
    }
    return -1;
  }
}
