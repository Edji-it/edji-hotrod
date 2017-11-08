import { Component, OnInit } from '@angular/core'

import { AuthService } from './../shared'

@Component({
  selector: 'hot-oauth-redirect',
  templateUrl: 'oauth-redirect.component.pug'
})

export class OAuthComponent implements OnInit {
  constructor(
    private _auth: AuthService
  ) { }

  ngOnInit() { }
}