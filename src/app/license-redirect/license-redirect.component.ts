import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'

// Project dependancies
import { User } from '../shared/datatypes'
import { LockerService, AuthService, AcademyService, UtilToolService } from '../_services'

@Component({
  selector: 'app-license-redirect',
  templateUrl: './license-redirect.component.pug',
  styleUrls: ['./license-redirect.component.scss'],
})
export class LicenseRedirectComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []
  public login: boolean = true

  public user: User
  public invitationId: string
  public tokenType: string
  public academyName: string = 'Academy'

  public errorKey: string = ''

  constructor(
    private _auth: AuthService,
    private route: ActivatedRoute,
    private _router: Router,
    private _locker: LockerService,
    private _academy: AcademyService,
    public _util: UtilToolService,
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
      }),
      this.route.params.subscribe(params => {
        this.invitationId = params.license_id
      }),
      this.route.queryParams.subscribe(query => {
        if (query.academy) {
          this.academyName = query.academy
        }
        if (query.tokenType) {
          this.tokenType = query.tokenType
        }
      }),
    )

    /**
     * if the license_id is defined and passed in properly through the query param on the route,
     * let's add it to the locker and then move to the login/register check
     */

    if (typeof this.invitationId != 'undefined' && this.invitationId != '') {
      // we need to log temps out so we give them the login / register screen
      if (this.user.isLoggedIn && this.user.type === 'temp') {
        this.changeAccount()
      }
      // if the user is logged in already, then we'll process the license
      if (this.user.isLoggedIn) {
        // if the user already accepted this license, redirect them to the dashboard.. otherwise process it
        if (this.user.license_ids.includes(this.invitationId) && this.user.hero_status) {
          this._router.navigate(['/dashboard'])
        }
      } else {
        // store the invitationId in the locker if we need to register the user or they need to login with Google
        this._locker.set('invitationId', this.invitationId)
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  /**
   * Tells the server we have a license to add to the user account
   * If coming from oauth or any other case where we have a invitationId on here, let's clear it from the locker
   */
  processLicense() {
    // if invitationId is in the locker let's take it out
    if (this._locker.has('invitationId')) {
      this._locker.remove('invitationId')
    }
    // tell the server we need to process the license on the user
    this._academy
      .acceptLicense(this.invitationId, this.tokenType ? { type: this.tokenType } : undefined)
      .pipe(take(1))
      .subscribe(
        (userWithLicense: any) => {
          // update the user across the app with the new license ID and hero status update
          this._auth
            .refreshUser()
            .pipe(take(1))
            .subscribe((updatedUser: any) => {
              let index = updatedUser.institution_ids.length - 1
              let institutionId = updatedUser.institution_ids[index]
              // once we update the user to add a license and make them a hero, let's redirect them to the dashboard
              this._router.navigate(['/license/welcome/' + institutionId])
            })
        },
        err => {
          console.error(err)
          let caught = false
          if (err.status === 403 && err.error.error === 'invite not found for email') {
            this.errorKey = 'serverError'
            caught = true
          }
          if (err.status === 403 && err.error.error === 'invalid license') {
            this.errorKey = 'invalidLicense'
            caught = true
          }
          if (err.status === 500 || !caught) {
            this.errorKey = 'licenseProcessError'
          }
        },
      )
  }

  /**
   * Log out and show log in form
   */
  public changeAccount(): void {
    this._auth.logout(true)
  }

  /**
   * Registered for License
   */
  public userRegistered(user: User): void {
    console.info('user updated')
  }
}
