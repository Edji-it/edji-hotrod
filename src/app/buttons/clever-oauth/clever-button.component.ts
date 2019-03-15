import { Component, Input, OnInit } from '@angular/core'

// Project Dependencies
import { AuthService, SecretSwitchesService } from './../../_services'

@Component({
  selector: 'edji-clever-button',
  styleUrls: [ './clever-button.component.scss' ],
  templateUrl: './clever-button.component.pug'
})

export class CleverButton implements OnInit {

  @Input() public dark: boolean

  constructor(
    private _auth: AuthService,
    private _secrets: SecretSwitchesService
  ) { }

  ngOnInit() { 
    
  }

  public cleverSignIn(): void {
    this._auth.oauthLogin('clever')
  }
}