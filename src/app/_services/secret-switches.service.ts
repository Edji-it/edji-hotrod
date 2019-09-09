/**
 * Secret Switches
 * - Handle feature flagging via url params
 * - Switches use "secret" as the query param key
 */
import { Injectable } from '@angular/core'
import { Params } from '@angular/router'
import { Observable, BehaviorSubject } from 'rxjs'
import * as Airtable from 'airtable'

// Project Dependencies
import { AuthService } from './auth.service'

@Injectable({
  providedIn: 'root',
})
export class SecretSwitchesService {
  private _airtable
  private base
  private user
  private env
  /**
   * Global Feature Flag object
   * - Keep updated when flags are added or removed, for reference
   * - Update via url param subscriptions inside of relevant components
   */
  public secretSwitches: Secrets = {}
  // Observable for receiving switch updates
  private secretSwitchesSource: BehaviorSubject<Secrets> = new BehaviorSubject({})
  public secretSwitchesUpdates: Observable<Secrets>

  // Secret Switch records
  private switchRecords: {
    feature_key?: string
    enable_for_user?: string
    enable_for_all?: string
    enabled_annoucement_toast?: string
    enabled_annoucement_toast_link?: string
    enable_for_user_emails?: string // comma separated
  }[] = []

  constructor(private _auth: AuthService) {
    this.secretSwitchesUpdates = this.secretSwitchesSource.asObservable()
    this.env = this._auth.getEnv()
    this.user = this._auth.getUser()

    this._airtable = Airtable

    this._airtable.configure({
      apiKey: 'keypBiIZw05gzqcD5',
    })

    // Secret Switches Base
    this.base = this._airtable.base('appQSAmUf3Y0kBQTk')

    // Fetch promotion copy base
    this.base('Feature Switches')
      .select({
        view: 'Service View',
      })
      .firstPage((err, records) => {
        if (err) {
          console.error(err)
          return
        }
        this.switchRecords = records
        this.processSwitchRecords(records, this.user)
      })

    // Ensure user that logs in during session sees enabled features
    this._auth.getCurrentUser().subscribe(user => {
      this.user = user
      if (this.switchRecords && user && user.email) {
        this.processSwitchRecords(this.switchRecords, user)
      }
    })
  }

  /**
   * Processes Secret Switch Airtable record
   * - Checks if enabled for user or everyone
   * @param records
   * @param user
   */
  private processSwitchRecords(records, user): void {
    records.forEach(record => {
      let feature = record.fields
      let enabledForUser: boolean
      let enabledForAll: boolean
      if (!feature.feature_key) {
        return
      }
      enabledForAll = feature.enable_for_all && feature.enable_for_all.indexOf(this.env) >= 0
      enabledForUser = feature.enable_for_user_emails && feature.enable_for_user_emails.indexOf(user.email) > -1
      if (enabledForAll || enabledForUser) {
        this.secretSwitches[feature.feature_key] = true
      }
    })
    // Emit switch update
    this.secretSwitchesSource.next(this.secretSwitches)
  }

  public processSwitches(params: Params): any {
    if (params && params['secret']) {
      this.secretSwitches[params['secret']] = true
    }
    // Emit switch update
    this.secretSwitchesSource.next(this.secretSwitches)
    // Return switches for immediate use
    return this.secretSwitches
  }
}

export interface Secrets {
  heroAvailable?: boolean
  googleAuth?: boolean
  academy?: boolean
}
