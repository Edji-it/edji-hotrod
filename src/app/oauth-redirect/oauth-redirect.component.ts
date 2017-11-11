import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import { AuthService } from './../shared'

@Component({
  selector: 'hot-oauth-redirect',
  templateUrl: 'oauth-redirect.component.pug'
})

export class OAuthComponent implements OnInit {

  private messages: {
    noToken?: boolean,
    noType?: boolean,
    noUser?: boolean,
    serverError?: boolean
  } = {}

  constructor(
    private _auth: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // grab that oauth token which is given by the server!
    const type = this.route.snapshot.params.type
    const token = decodeURIComponent(this.route.snapshot.queryParams.token)

    // tell them what's up if there's no token or oauth type...
    if (!type) {
      return this.messages.noType = true
    } else if (!token) {
      return this.messages.noToken = true
    }

    this._auth.getUserWithAuthToken(type, token).take(1).subscribe((user) => {
      console.log(user)
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