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
  
  /**
   * @todo clean out after Clever launch
   */
  private showClever: boolean

  constructor(
    private _auth: AuthService,
    private _secrets: SecretSwitchesService
  ) { }

  ngOnInit() { 
    /**
     * @todo clean out after Clever launch
     */
    this._secrets.secretSwitchesUpdates.subscribe((switches) => {
      this.showClever = switches.cleverButton
    })
    
  }

  public cleverSignIn(): void {
    this._auth.oauthLogin('clever')
  }
}