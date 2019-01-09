import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService, LockerService } from './../_services'

@Component({
  selector: 'hot-oauth-redirect',
  templateUrl: './oauth-redirect.component.pug'
})

export class OAuthComponent implements OnInit {

  public messages: {
    noToken?: boolean,
    noUser?: boolean,
    error?: boolean,
    serverError?: boolean,
    duplicate_user?: boolean
  } = {}

  // Error display 
  public hasError: boolean

  private licenseId = ''
  private redirectRouteUrl = '/dashboard'

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private _locker: LockerService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // grab that oauth token which is given by the server!
    const type = this.route.snapshot.params['type']
    const encodedToken = this.route.snapshot.queryParams.token
    const error = this.route.snapshot.queryParams.error

    if (error) {
      this.hasError = true
      return this.messages[error] = true
    }

    // tell them what's up if there's no token or oauth type...
    if (!encodedToken || encodedToken.length < 1) {
      this.hasError = true
      return this.messages.noToken = true
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

    const token = decodeURIComponent(encodedToken)

    this._auth.getUserWithAuthToken(type, token).pipe(take(1)).subscribe((res) => {
      // if we are coming here from a landing page like the license accept, then the success case should take us back to that landing page again
      if (this.licenseId!=='' && this.licenseId.length>0) {
        this._router.navigate(['/license/accept/' + this.licenseId])
        return
      }
      this._router.navigateByUrl(this.redirectRouteUrl)
    }, (err) => {
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
    })
  }
}