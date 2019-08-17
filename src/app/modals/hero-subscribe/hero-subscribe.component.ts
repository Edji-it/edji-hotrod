import { Observable, Subject, of } from 'rxjs'
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Angulartics2 } from 'angulartics2'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { debounceTime, map, take } from 'rxjs/operators'

// Project dependencies
import { AuthService, BumblebeeService, MailchimpService, CopyService } from '../../_services'
import { User } from 'src/app/shared/datatypes'

declare var Stripe: any

@Component({
  selector: 'hero-subscribe-modal',
  templateUrl: './hero-subscribe.component.pug',
  styleUrls: ['./hero-subscribe.component.scss'],
})
export class HeroSubscribeComponent implements OnInit {
  public tempHide: boolean
  public card: any
  public loading: boolean = false
  public userNowHero: boolean
  public stripe: any
  public stripeMessage: string
  public initWithCoupon: boolean = false
  public customCouponCode: string = ''
  // Discount value used for DISPLAY ONLY
  public percentOff: number = 0
  public newPrice: number = 60
  public joiningAcademy: boolean = false
  public currentUser: User
  public previouslyCancelled: boolean = false
  public resubscribeSent: boolean = false
  public subscription_id: string = ''
  // Promotional sitewide offer
  public offerDetails: string
  // private couponCode: string

  public sForm: FormGroup
  private subscriptions: any[] = []

  @Input()
  couponCode: string = ''
  @Input()
  goHeroLocation: string = 'subscribeModal'

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter()
  @Output()
  heroWasBorn: EventEmitter<any> = new EventEmitter()

  constructor(
    public _auth: AuthService,
    private _bumblebee: BumblebeeService,
    private _chimp: MailchimpService,
    private angulartics: Angulartics2,
    private fb: FormBuilder,
    private _copy: CopyService,
  ) {}

  ngOnInit() {
    // get the user
    this.subscriptions.push(
      this._auth.currentUser.subscribe(user => {
        this.currentUser = user
      }),
      this._auth.getStripeSubscriptions().subscribe(subscriptions => {
        this.previouslyCancelled = this.activeSubscription(subscriptions)
      }),
      this.subscriptions.push(
        this._copy.activePromotions.subscribe(promo => {
          if (promo.offerDetails) {
            this.offerDetails = promo.offerDetails
          }
        }),
      ),
    )
    // Construct formgroup
    this.sForm = this.fb.group(
      {
        couponCode: [this.couponCode, [], this.validateCoupon.bind(this)],
      },
      { updateOn: 'blur' },
    )

    // Create a Stripe client
    if (this._auth.getEnv() === 'dev') {
      this.stripe = Stripe('pk_test_e2lOurNpSI745MOUdu2LgzOu')
    } else {
      this.stripe = Stripe('pk_live_IOwqaYAERP6biScBTFk3Csrm')
    }

    if (this.couponCode && this.couponCode.length > 0) {
      this.initWithCoupon = true
    }

    // Create an instance of Elements
    var elements = this.stripe.elements()

    // Custom styling can be passed to options when creating an Element.
    // (Note that this demo uses a wider set of styles than the guide below.)
    var style = {
      base: {
        color: '#32325d',
        lineHeight: '24px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    }

    // Create an instance of the card Element
    this.card = elements.create('card', { style: style })

    // Add an instance of the card Element into the `card-element` <div>
    this.card.mount('#card-element')

    // Handle real-time validation errors from the card Element.
    this.card.addEventListener('change', function(event) {
      var displayError = document.getElementById('card-errors')
      if (event.error) {
        displayError.textContent = event.error.message
      } else {
        displayError.textContent = ''
      }
    })
  }

  private validateCoupon(control: AbstractControl): Observable<any> {
    let coupon = control.value && control.value.toUpperCase()
    // Reset variables
    this.joiningAcademy = false
    this.percentOff = 0
    // Don't bother checking empty coupons
    if (!coupon || coupon.length < 1) {
      return of({ invalid: true })
    } else {
      return this._auth.validateHeroCoupon(coupon).pipe(
        debounceTime(1000),
        map(
          res => {
            if (res.percent_off) {
              this.percentOff = res.percent_off
              this.newPrice = ((100 - this.percentOff) / 100) * 60
            }
            // Hack for detecting Hero Academy teachers
            if (coupon.indexOf('HA-') == 0) {
              this.joiningAcademy = true
            }
            return null
          },
          err => {
            return { invalid: true }
          },
        ),
      )
    }
  }

  private checkout() {
    let eventAction = 'addSubscription'
    if (this.couponCode && this.couponCode.length > 0) {
      eventAction += '-' + this.couponCode
    } else if (this.customCouponCode && this.customCouponCode.length > 0) {
      eventAction += '-' + this.customCouponCode
    }

    this.loading = true

    if (this.percentOff == 100) {
      // referral
      this.becomeHero()
    } else {
      this.stripe.createToken(this.card).then(result => {
        if (result.error) {
          // Inform the user if there was an error
          var errorElement = document.getElementById('card-errors')
          errorElement.textContent = result.error.message
          this.loading = false
        } else {
          // organic purchase
          this.becomeHero(result.token.id)
        }
      })
    }
  }

  private becomeHero(stripeToken?: string) {
    let eventAction = 'addSubscription'
    this._auth
      .subscribeToHero(
        stripeToken ? stripeToken : '',
        this.initWithCoupon
          ? this.couponCode.toUpperCase()
          : this.sForm.valid
          ? this.sForm.controls['couponCode'].value.toUpperCase()
          : '',
      )
      .subscribe(
        data => {
          this._chimp.addToActiveHeroList(this._auth.getUser())
          // track user adding hero subscription in analytics
          this.angulartics.eventTrack.next({
            action: 'goHero_promoPage_' + this.goHeroLocation,
            properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
          })
          this.userNowHero = true
          this.loading = false
          if (data.user) {
            this._auth.setUser(data.user)
            this._bumblebee.userHeroAction(data.user, 'subscribed')
          }
        },
        error => {
          this.loading = false
          this.stripeMessage =
            'There was an error processing your payment. Please try correcting your payment information, or <a href="mailto:support@edji.it" class="link">contact our support team</a>.'
          this._bumblebee.reportError(error)
        },
      )
  }

  // a user that was previously a hero and cancelled will need to contact support to handle going hero again
  public resumeHero(): void {
    this.loading = true
    if (this.subscription_id) {
      this._auth.rejoinHero(this.subscription_id).subscribe(
        data => {
          // track user adding hero subscription in analytics
          this.angulartics.eventTrack.next({
            action: 'rejoinHero_promoPage_' + this.goHeroLocation,
            properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
          })
          this.userNowHero = true
          this.loading = false
          if (data.user) {
            this._bumblebee.userHeroAction(data.user, 'subscribed')
          }
        },
        error => {
          this.loading = false
          this.stripeMessage =
            'There was an error processing your payment. Please try correcting your payment information, or <a href="mailto:support@edji.it" class="link">contact our support team</a>.'
          this._bumblebee.reportError(error)
        },
      )
    }
  }

  // determines which goHero call we need to make
  private activeSubscription(subscriptions: any): boolean {
    // we need to both check if we have an active subscription and if not, what was the most recent cancellation
    let len = subscriptions.length
    for (var i = 0; i < len; i++) {
      let sub = subscriptions[i]
      if (this._auth.getStripeDate(sub.current_period_end) > new Date()) {
        this.subscription_id = sub.id
        // we have ourselves an active subsription!
        return true
      }
    }
    return false
  }
}
