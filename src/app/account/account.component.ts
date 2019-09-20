import { Angulartics2 } from 'angulartics2'
import { ActivatedRoute, Router } from '@angular/router'
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'

// Project Dependencies
import { AuthService } from '../_services/auth.service'
import { User } from '../shared/datatypes'
import { EdjiDatePipe } from '../_pipes'

@Component({
  selector: 'edji-account',
  styleUrls: ['./account.component.scss'],
  templateUrl: './account.component.pug',
})
export class AccountComponent implements OnInit, OnDestroy {
  /*
  Last Mod: 29 July 2017 - Nick Pumper

  The page for the user's account info. A profile page.
  */

  public nameInitials: string = '' // we gonna use these for the temp profile pic
  public currentUser: any
  public customerSubEnd: string = ''
  public customerCancelDate: string = ''
  public linkedAccounts: { clever?: boolean; google?: boolean } = {}

  public showPassModal: boolean = false
  public showUploadProfPicModal: boolean = false
  public showHeroSubModal: boolean = false
  public showHeroChangeModal: boolean = false

  public canceled: boolean = false
  public academyHero: boolean = false

  private subscriptions: any[] = []

  constructor(private _auth: AuthService, public _router: Router, private angulartics: Angulartics2) {
    this.nameInitials = ''
  }

  ngOnInit() {
    this.subscriptions.push(
      this._auth.currentUser.subscribe(user => {
        this.currentUser = user
        this.updateHeroStatus()
        if (user.oauth) {
          this.populateLinkedAccounts(user.oauth)
        }
      }),
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  public getUserInitials(): string {
    var firstInitialPos
    var result
    result = ''
    firstInitialPos = 0 // needed for creating name initials
    return result
  }

  public trackHeroClick(): void {
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action: 'heroInterest_accountPage',
      properties: {
        category: this._auth.setAnalyticEventCategory(),
        label: this._auth.setAnalyticEventLabel(),
      },
    })
  }

  // Get customer info back from Stripe for renewal details and active subscription status
  public updateHeroStatus(): void {
    if (this.currentUser.stripe_customer_id) {
      this._auth.getStripeSubscriptions().subscribe(subscriptions => {
        this.getSubscription(subscriptions)
      })
    } else if (this.currentUser.license_ids && this.currentUser.license_ids.length) {
      this.academyHero = true
    }
  }

  /**
   * Check for linked accounts (display linked/how to link)
   * @param oauth oauth array from user object
   */
  private populateLinkedAccounts(oauth: any[]): void {
    this.linkedAccounts = {}
    for (let i = 0; i < oauth.length; i++) {
      this.linkedAccounts[oauth[i].type] = true
    }
  }

  // get the latest active subscription
  private getSubscription(subscriptions: any): void {
    // we need to both check if we have an active subscription and if not, what was the most recent cancellation
    let len = subscriptions.length
    let maxCancel = 0
    for (var i = 0; i < len; i++) {
      let sub = subscriptions[i]
      if (!sub.canceled_at) {
        this.canceled = false
        // we have ourselves an active subsription! Set the necessary variables for displaying useful info
        this.customerSubEnd = this._auth.getStripeDate(sub.current_period_end).toString()
        return
      }
      if (sub.canceled_at && sub.canceled_at > maxCancel) {
        this.canceled = true
        maxCancel = sub.canceled_at
        this.customerCancelDate = this._auth.getStripeDate(maxCancel).toString()
        this.customerSubEnd = this._auth.getStripeDate(sub.current_period_end).toString()
      }
    }
  }
}
