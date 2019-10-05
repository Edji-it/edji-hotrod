import { Angulartics2 } from 'angulartics2'
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { take } from 'rxjs/operators'

import { AuthService, BumblebeeService } from './../../_services'

@Component({
  selector: 'hero-change-modal',
  templateUrl: './hero-change.component.pug',
  styleUrls: ['./hero-change.component.scss'],
})
export class HeroChangeComponent implements OnInit {
  private user: any = {}
  private isUpdated: boolean
  private updating: boolean

  public confirmCancelShow: boolean
  public updateCardShow: boolean
  public subscriptionShow: boolean = true

  public isCanceled: boolean
  public canceling: boolean

  public cancelMsg: string = ''

  public stripe: any
  public subscriptionPrice: number = 60
  public cardInfo: any
  public cardBrand: string = 'visa'

  // Form values
  private subtype: string = 'yearly'

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter() // Tell the listening page to close the darned thing.

  constructor(private _auth: AuthService, private _bumblebee: BumblebeeService, private angulartics: Angulartics2) {}

  async ngOnInit() {
    this.user = this._auth.getUser()
    this.subtype = 'yearly'
    this.stripe = this._auth.getStripe()
    // Create an instance of Elements
    let elements = this.stripe.elements()
    console.log(elements)

    try {
      this.cardInfo = await this._auth.getStripeCustomerCard(this.user.stripe_customer_id).toPromise()
      this.cardBrand = this.cardInfo.brand.toLowerCase()
      console.log(this.cardInfo)
    } catch (err) {
      console.error(err)
    }

    try {
      let customer = await this._auth.getStripeCustomer(this.user.stripe_customer_id).toPromise()
      this.subscriptionPrice = customer.subscriptions.data[0].plan.amount / 100
      console.log(customer)
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Hook into the close event
   */
  close(): void {
    // Reset defaults
    this.isUpdated = false
    this.confirmCancelShow = false
    this.isCanceled = false

    this.closeModal.emit()
  }

  /**
   * @param type 'yearly' or 'monthly'
   */
  updateType(type: string) {
    this.updating = true
    this._auth
      .updateHeroSub(type)
      .pipe(take(1))
      .subscribe(
        (data: any) => {
          this.updating = false
          this.isUpdated = true
          if (data.user) {
            this._bumblebee.userHeroAction(data.user, 'unsubscribed')
            this._auth.setUser(data.user)
          }
        },
        err => {
          this.updating = false
        },
      )
  }

  /**
   * Changes user to Hero status "unsubscribed"
   */
  cancelSub() {
    this.canceling = true
    this.cancelMsg = ''
    // console.log(this.user.hero.subscription_id)
    this._auth
      .cancelHeroSubscription()
      .pipe(take(1))
      .subscribe(
        data => {
          // fire an analytic event here for tracking purposes
          this.angulartics.eventTrack.next({
            action: 'subscription_cancel',
            properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
          })

          this.canceling = false
          this.isCanceled = true
          if (data.user) {
            this._auth.setUser(data.user)
          }
        },
        err => {
          this.canceling = false
          this.cancelMsg =
            "Sorry, canceling your subscription failed. <a class='link' href='mailto:support@edji.it'>Please contact support</a>."
          console.log(err)
        },
      )
  }

  public toggleView(view: string): void {
    this.updateCardShow = false
    this.confirmCancelShow = false
    this.subscriptionShow = false
    switch (view) {
      case 'subscriptionShow':
        this.subscriptionShow = true
        break
      case 'updateCardShow':
        this.updateCardShow = true
        break
      case 'confirmCancelShow':
        this.confirmCancelShow = true
        break
      default:
        this.subscriptionShow = true
        this.updateCardShow = false
        this.confirmCancelShow = false
    }
  }
}
