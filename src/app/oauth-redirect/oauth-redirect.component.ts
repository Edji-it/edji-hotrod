import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'

import { AuthService } from './../shared'

@Component({
  selector: 'hot-oauth-redirect',
  templateUrl: 'oauth-redirect.component.pug'
})

export class OAuthComponent implements OnInit {

  private messages: {
    noToken?: boolean,
    noUser?: boolean,
    error?: boolean,
    serverError?: boolean
  } = {}

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // grab that oauth token which is given by the server!
    const type = this.route.snapshot.params['type']
    const encodedToken = this.route.snapshot.queryParams.token
    const error = this.route.snapshot.queryParams.error

    // If the locker has a referral_id that means the user landed on the edji site as referred by a friend!
    if (this._auth.checkStorage('referral_id')) {
      let user = this._auth.getUser()
      // Let's add the referral_id to the user object
      user.referral_id = this._auth.getFromStorage('referral_id')
      this._auth.updateUser( user )
        .take(1)
        .subscribe(
          (user) => {
            // Once we have successfully added the referral_id to the user object, let's clear this from local storage so we don't have any issues
            this._auth.deleteFromStorage('referral_id')
          },
          (error) => {
            console.log(error)
          }
        )
    }

    if (error) {
      return this.messages[error] = true
    }

    // tell them what's up if there's no token or oauth type...
    if (!encodedToken || encodedToken.length < 1) {
      return this.messages.noToken = true
    }

    const token = decodeURIComponent(encodedToken)

    this._auth.getUserWithAuthToken(type, token).take(1).subscribe((res) => {
      this._auth.setUser(res.user)
      this._auth.setToken(res.token)
      this._router.navigate(['/dashboard'])
    }, (err) => {
      console.error(err)
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