import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { take } from 'rxjs/operators'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, LockerService, MessageService, BumblebeeService } from './../_services'
import { User } from '../shared/datatypes'

@Component({
  selector: 'hot-oauth-redirect',
  templateUrl: './oauth-redirect.component.pug',
})
export class OAuthComponent implements OnInit {
  public messages: {
    noToken?: boolean
    noUser?: boolean
    error?: boolean
    serverError?: boolean
    duplicate_user?: boolean
    linkError?: boolean
  } = {}

  // Error display
  public hasError: boolean
  // Copy display
  private loginType: string
  public loginTypeDisplay: string = 'Google'
  private loginTypeMap = {
    google: 'Google',
    clever: 'Clever',
  }
  private licenseId = ''
  private redirectRouteUrl = '/dashboard'
  // Oauth token
  public oAuthToken: string
  // Current user, for linking existing already logged in
  private currentUser: User

  constructor(
    private _auth: AuthService,
    private _bee: BumblebeeService,
    private _router: Router,
    private _locker: LockerService,
    private route: ActivatedRoute,
    private _messages: MessageService,
    private angulartics: Angulartics2,
  ) { }

  ngOnInit() {
    this.currentUser = this._auth.getUser()
    // grab that oauth token which is given by the server!
    this.loginType = this.route.snapshot.params['type']
    const encodedToken = this.route.snapshot.queryParams.token
    const error = this.route.snapshot.queryParams.error

    if (this.loginTypeMap[this.loginType]) {
      this.loginTypeDisplay = this.loginTypeMap[this.loginType]
    }

    if (error) {
      if (encodedToken) {
        // error was returned, but indicates an additional step such as linking
        this.oAuthToken = encodedToken
      } else {
        // error preventing user from moving forward
        this.hasError = true
      }
      return (this.messages[error] = true)
    }

    // tell them what's up if there's no token or oauth type...
    if (!encodedToken || encodedToken.length < 1) {
      this.hasError = true
      return (this.messages.noToken = true)
    }

    // if we have a license to process
    if (this._locker.has('licenseId')) {
      this.licenseId = this._locker.get('licenseId')
      this._locker.remove('licenseId')
    }

    // if the user is coming from another route, let's redirect them to it
    if (this._locker.has('oauthRedirect')) {
      this.redirectRouteUrl = this._locker.get('oauthRedirect')
      this._locker.remove('oauthRedirect')
    }

    this.oAuthToken = decodeURIComponent(encodedToken)

    /**
     * Check if user has already linked their account
     * - This also functions as a safety if the connection is interrupted or refreshed while redirecting
     */
    let alreadyLinked: boolean
    if (this.currentUser && this.currentUser.isLoggedIn && this.currentUser.oauth) {
      this.currentUser.oauth.forEach(oauthObj => {
        if (oauthObj.type === this.loginType) {
          alreadyLinked = true
        }
      })
    }

    if (alreadyLinked) {
      this.routeAfterOAuth()
    } else if (this.currentUser && this.currentUser.isLoggedIn) {
      this.loginWithOauth()
    } else {
      this.linkAfterLogin()
    }
  }

  /**
   * Log in with OAuth
   */
  loginWithOauth() {
    this._auth
      .getUserWithAuthToken(this.loginType, this.oAuthToken)
      .pipe(take(1))
      .subscribe(
        res => {
          // fire an analytic event here for tracking purposes
          this.angulartics.eventTrack.next({
            action: 'login',
            properties: {
              category: this._auth.setAnalyticEventCategory(),
              label: this._auth.setAnalyticEventLabel(),
            },
          })
          this.routeAfterOAuth()
        },
        err => {
          console.error(err)
          this.hasError = true
          // Set specific message
          switch (err.status) {
            case 400:
            case 404:
              this.messages.noUser = true
              break
            case 500:
            default:
              this.messages.serverError = true
          }
        },
      )
  }

  /**
   * Upon successful log in, link
   * @param thing
   */
  linkAfterLogin(user?: User) {
    let type = this.loginType
    let token = this.oAuthToken

    this._auth
      .linkOauth(type, token)
      .pipe(take(1))
      .subscribe(
        user => {
          // Confirm with toast
          this._messages.sendToast({
            id: 'oauth-link',
            type: 'success',
            message: 'Successfully linked your Edji account',
          })
          // Account successfully linked!
          this.routeAfterOAuth()
        },
        error => {
          this.messages.linkError = true
        },
      )
  }


  /**
   * Route after authorization
   */
  routeAfterOAuth(): void {
    // if we are coming here from a landing page like the license accept, then the success case should take us back to that landing page again
    if (this.licenseId !== '' && this.licenseId.length > 0) {
      this._router.navigate(['/license/accept/' + this.licenseId])
    } else if (this.redirectRouteUrl) {
      this._router.navigateByUrl(this.redirectRouteUrl)
    } else {
      this._router.navigate(['/dashboard'])
    }
  }
}
