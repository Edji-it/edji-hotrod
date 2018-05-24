import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { take } from 'rxjs/operators'

import { AuthService } from './../shared'

@Component({
  selector: 'hot-oauth-redirect',
  templateUrl: './oauth-redirect.component.pug'
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

    if (error) {
      return this.messages[error] = true
    }

    // tell them what's up if there's no token or oauth type...
    if (!encodedToken || encodedToken.length < 1) {
      return this.messages.noToken = true
    }

    const token = decodeURIComponent(encodedToken)

    this._auth.getUserWithAuthToken(type, token).pipe(take(1)).subscribe((res) => {
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