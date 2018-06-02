import { Observable } from 'rxjs'
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Angulartics2 } from 'angulartics2'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { debounceTime, map } from 'rxjs/operators'

// Project dependencies
import { AuthService, BumblebeeService } from '../../_services'

declare var Stripe: any

@Component({
  selector: 'hero-subscribe-modal',
  templateUrl: './hero-subscribe.component.html',
  styleUrls: ['./hero-subscribe.component.scss']
})
export class HeroSubscribeComponent implements OnInit {

  public tempHide: boolean
  public card: any
  public loading = false
  public userNowHero: boolean
  public stripe: any
  public stripeMessage: string
  public initWithCoupon = false
  public customCouponCode = ''
  // Discount value used for DISPLAY ONLY
  public percentOff = 0
  public newPrice = 60
  public joiningAcademy = false
  // private couponCode: string

  public sForm: FormGroup

  @Input()
  couponCode = ''

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter()
  @Output()
  heroWasBorn: EventEmitter<any> = new EventEmitter()

  constructor(
    private _auth: AuthService,
    private _bumblebee: BumblebeeService,
    private angulartics: Angulartics2,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    // Construct formgroup
    this.sForm = this.fb.group({
      couponCode: [
        this.couponCode,
        [],
        this.validateCoupon.bind(this)
      ]
    }, { updateOn: 'submit' })

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
    const elements = this.stripe.elements()

    // Custom styling can be passed to options when creating an Element.
    // (Note that this demo uses a wider set of styles than the guide below.)
    const style = {
      base: {
        color: '#32325d',
        lineHeight: '24px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }

    // Create an instance of the card Element
    this.card = elements.create('card', {style: style})

    // Add an instance of the card Element into the `card-element` <div>
    this.card.mount('#card-element')

    // Handle real-time validation errors from the card Element.
    this.card.addEventListener('change', function(event) {
      const displayError = document.getElementById('card-errors')
      if (event.error) {
        displayError.textContent = event.error.message
      } else {
        displayError.textContent = ''
      }
    })

  }

  private validateCoupon(control: AbstractControl): Observable<any> {
    const coupon = control.value && control.value.toUpperCase()
    // Reset variables
    this.joiningAcademy = false
    this.percentOff = 0
    return this._auth.validateHeroCoupon(coupon)
      .pipe(
        debounceTime(1000),
        map(
        (res) => {
          if (res.percent_off) {
            this.percentOff = res.percent_off
            this.newPrice = (100 - this.percentOff) / 100 * 60
          }
          // Hack for detecting Hero Academy teachers
          if (coupon.indexOf('HA-') == 0) {
            this.joiningAcademy = true
          }
          return null
        },
        (err) => {
          return { invalid: true }
        }
      ))
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
      this.becomeHero()
    } else {
      this.stripe.createToken(this.card).then((result) => {
        if (result.error) {
          // Inform the user if there was an error
          const errorElement = document.getElementById('card-errors')
          errorElement.textContent = result.error.message
          this.loading = false
        } else {
          this.becomeHero(result.token.id)
        }
      })
    }
  }

  private becomeHero(stripeToken ?: string) {
    const eventAction = 'addSubscription'
    // track user adding hero subscription in analytics
        this.angulartics.eventTrack.next({ action: eventAction, properties: { category: 'heroFeature', label: 'attempt' }})
        this._auth.subscribeToHero(stripeToken ? stripeToken : '', this.initWithCoupon ? this.couponCode.toUpperCase() : this.sForm.valid ? this.sForm.controls['couponCode'].value.toUpperCase() : '')
        .subscribe(
          data => {
            // track user adding hero subscription in analytics
            this.angulartics.eventTrack.next({ action: eventAction, properties: { category: 'heroFeature', label: 'success' }})
            this.userNowHero = true
            this.loading = false
            if (data.user) {
              this._auth.setUser(data.user)
              this._bumblebee.userHeroAction(data.user, 'subscribed')
            }
          },
          error => {
            // track user adding hero subscription in analytics
            this.angulartics.eventTrack.next({ action: eventAction, properties: { category: 'heroFeature', label: 'failure' }})
            this.loading = false
            this.stripeMessage = 'There was an error processing your payment. Please try correcting your payment information, or <a href="mailto:support@edji.it" class="link">contact our support team</a>.'
            this._bumblebee.reportError(error)
          })
  }
}
