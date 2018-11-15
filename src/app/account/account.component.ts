import { Angulartics2 } from 'angulartics2';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

// Project Dependencies
import { AuthService } from '../_services/auth.service';
import { User } from '../shared/datatypes';
import { EdjiDatePipe } from '../_pipes';

@Component({
  selector: 'edji-account',
  styleUrls: ['./account.component.scss'],
  templateUrl: './account.component.pug'
})
export class AccountComponent implements OnInit, OnDestroy {

  /*
  Last Mod: 29 July 2017 - Nick Pumper

  The page for the user's account info. A profile page.
  */
  
  public nameInitials  : string = "" // we gonna use these for the temp profile pic
  public currentUser   : any
  public cancelled : boolean = false
  public showPassModal : boolean = false
  public showUploadProfPicModal : boolean = false
  public showHeroSubModal: boolean = false
  public showHeroChangeModal: boolean = false
  public customerInfo: any
  public customerSubEnd: string = ""

  private subscriptions : any[] = []

  constructor(
    private _auth: AuthService, 
    private route: ActivatedRoute, 
    public _router: Router,
    private angulartics: Angulartics2
  ) { 
    this.nameInitials = "";
  }

  ngOnInit() { 
    this.subscriptions.push(
      this._auth.currentUser.subscribe(
        user => {
          this.currentUser = user
          console.log(user)
          this.updateHeroStatus()
        }
      )
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }

  public getUserInitials(): string {
    var firstInitialPos
    var result
    result = ""
    firstInitialPos = 0 // needed for creating name initials
    return result
  }

  // Accessor for user.avatar
  // Get the avatar from the user object
  public getAvatar(): string {
    let avatar
    avatar = this.currentUser.avatar
    return avatar
  }

  private trackHeroClick(): void {
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({ 
      action: 'goHero_accountPage', 
      properties: { 
        category: this._auth.setAnalyticEventCategory(), 
        label: this._auth.setAnalyticEventLabel() 
      }
    })
  }

  // Get customer info back from Stripe for renewal details and active subscription status
  public updateHeroStatus(): void {
    this._auth.getStripeCustomer(this.currentUser.stripe_customer_id).subscribe(
      customer => {
        this.customerInfo = customer
        console.log(customer)
        if (customer && customer.subscriptions && customer.subscriptions.data) {
          let lastSub = customer.subscriptions.data.length - 1
          // Check to see if they have an active subscription
          if (lastSub < 0 || this.currentUser.hero_cancelled) {
            this.cancelled = true
          } else {
            // Stripe sends the date back as the UTC Epoch, so we'll convert it here
            let utcSeconds = customer.subscriptions.data[lastSub].current_period_end
            let date = new Date(0)
            date.setUTCSeconds(utcSeconds)
            this.customerSubEnd = date.toDateString()
          }
          console.log(this.cancelled)
        }
      }
    )
  }
}