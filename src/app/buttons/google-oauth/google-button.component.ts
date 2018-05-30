import { Component, Input, OnInit } from '@angular/core'

// Project Dependencies
import { AuthService } from './../../_services'

@Component({
  selector: 'hot-google-button',
  styleUrls: [ './google-button.component.scss' ],
  templateUrl: './google-button.component.pug'
})

export class GoogleButton implements OnInit {

  @Input() public copy: string = "Google"
  
  constructor(
    private _auth: AuthService
  ) { }

  ngOnInit() { }

  public googleSignIn(): void {
    this._auth.oauthLogin('google')
  }
}