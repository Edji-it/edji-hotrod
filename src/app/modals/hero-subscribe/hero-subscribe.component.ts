import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

// Project dependencies
import { AuthService } from '../../shared';

declare var Stripe: any

@Component({
  selector: 'hero-subscribe-modal',
  templateUrl: './hero-subscribe.component.html',
  styleUrls: ['./hero-subscribe.component.scss']
})
export class HeroSubscribeComponent implements OnInit {

  private tempHide: boolean
  private card: any
  private subtype: string = 'yearly'
  private loading: boolean = false
  private userNowHero: boolean
  private stripe: any

  // @Input()
  // monthlyAmountOff: number

  @Input()
  yearlyAmountOff: number

  @Input()
  couponCode: string

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter()
  @Output()
  heroWasBorn: EventEmitter<any> = new EventEmitter()
  
  constructor(private _auth: AuthService) { }

  ngOnInit() {
    // Create a Stripe client
    if (this._auth.getEnv() === 'dev') {
      this.stripe = Stripe('pk_test_e2lOurNpSI745MOUdu2LgzOu')
    } else {
      this.stripe = Stripe('pk_live_IOwqaYAERP6biScBTFk3Csrm')
    }

    // Create an instance of Elements
    var elements = this.stripe.elements();

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
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    // Create an instance of the card Element
    this.card = elements.create('card', {style: style});

    // Add an instance of the card Element into the `card-element` <div>
    this.card.mount('#card-element');

    // Handle real-time validation errors from the card Element.
    this.card.addEventListener('change', function(event) {
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
    
  }

  private checkout() {
      this.loading = true
      this.stripe.createToken(this.card).then((result) => {
        if (result.error) {
          // Inform the user if there was an error
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
          this.loading = false
        } else {
          this._auth.subscribeToHero(this.subtype, result.token.id, this.couponCode)
            .subscribe(
              data => {
                this.userNowHero = true
                this.loading = false
                if (data.user) {
                  this._auth.setUser(data.user)
                }
              },
              error => {
                this.loading = false
              })

        }
      });
    // this.tempHide = true
    
    // var handler = (<any>window).StripeCheckout.configure({
    //   key: 'pk_test_e2lOurNpSI745MOUdu2LgzOu',
    //   locale: 'auto',
    //   token: function (token: any) {
    //     // You can access the token ID with `token.id`.
    //     // Get the token ID to your server-side code for use.
    //   }
    // });

    // handler.open({
    //   name: 'Demo Site',
    //   description: 'Monthly Subscription',
    //   amount: 2000
    // });
  }

  // getMonthlyPrice() : number {
  //   return Math.round( (5 - this.monthlyAmountOff)*100 )/100
  // }

  getYearlyPrice() : number {
    return Math.round(6000 - this.yearlyAmountOff)/100
  }
  

}