import { Component, OnInit } from '@angular/core'

import { AuthService } from './../../shared'

@Component({
  selector: 'hot-google-button',
  templateUrl: 'google-button.component.pug'
})

export class GoogleButton implements OnInit {
  constructor(
    private _auth: AuthService
  ) { }

  ngOnInit() { }

  private googleSignIn(): void {
    this._auth.oauthLogin('google')
  }
}