/**
 * Secret Switches
 * - Handle feature flagging via url params
 * - Switches use "secret" as the query param key
 */
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SecretSwitchesService {

  /**
   * Global Feature Flag object
   * - Keep updated when flags are added or removed, for reference
   * - Update via url param subscriptions inside of relevant components
   */
  public secretSwitches: Secrets = {}

  constructor() { }

  public processSwitches(params: Params) : any {
    if(params && params['secret']){
      this.secretSwitches[params['secret']] = true
    }
    return this.secretSwitches
  }
}

export interface Secrets {
    heroAvailable?: boolean
    googleAuth?: boolean
    academy?: boolean
}