import { Component, Input, OnInit } from '@angular/core';

import { AuthService } from './../../shared'

@Component({
  selector: 'hot-google-button',
  styleUrls: [ './google-button.component.scss' ],
  template: require('pug-loader!./google-button.component.pug')()
})

export class GoogleButton implements OnInit {

  @Input() private copy: string = "Google"
  
  constructor(
    private _auth: AuthService
  ) { }

  ngOnInit() { }

  private googleSignIn(): void {
    this._auth.oauthLogin('google')
  }
}