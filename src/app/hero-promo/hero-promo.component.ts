import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { AuthService } from '../shared';

@Component({
  selector: 'app-hero-promo',
  templateUrl: './hero-promo.component.html',
  styleUrls: ['./hero-promo.component.scss']
})
export class HeroPromoComponent implements OnInit, OnDestroy {

  private countdownDate
  private countdownText: string
  private countdownOver: boolean
  private subMsg : string
  private subError: boolean
  private subSuccess: boolean
  private showLoginModal: boolean
  private showHeroSubModal: boolean
  private cancelGetPriceCall: boolean = false

  private heroPrice: number = 4000

  private subscriptions: Subscription[] = []

  constructor(private _auth: AuthService, private route: ActivatedRoute, private _router: Router) { }

  ngOnInit() {
    this.subscriptions.push(
      this.route.params
        .subscribe((params) => { 
          if(params && params['secretSwitch']){
              this._auth.secretSwitches[params['secretSwitch']] = true
              if (this._auth.secretSwitches['countdownOver']) {
                  this.countdownOver = true
              }
          }
        })
    );
    
    this.countdownDate = new Date("Aug 15, 2017 12:00:00").getTime()
    // kick off countdown
    this.incrementer()
    // Conitnuously check for Hero Count
    this.getHeroPrice()
  }

  ngOnDestroy() {
    this.cancelGetPriceCall = true
  }

  private getHeroPrice(): void {
    this._auth.getHeroPrice()
      .toPromise()
      .then( 
        data => {
          if (data.cost) {
            this.heroPrice = data.cost
          }

          // this can be set to cancel the recursion
          if (this.cancelGetPriceCall) {
            return
          } else {
            setTimeout(() => {
              this.getHeroPrice()
            }, 2000)
          }
        }, error => {
          console.error(error)
        })
  }

  private incrementer() : void {
    // Get todays date and time
    var now = new Date().getTime();

    // Find the distance between now an the count down date
    var distance = this.countdownDate - now;

    // Time calculations for days, hours, minutes and seconds
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // If the count down is finished, handle it
    if (distance < 0) {
      // clearInterval(this.intervalVar);
      this.countdownText = "0d 0h 0m 0s"
      this.countdownOver = true
    } else {
      // Display the result in the element with id="demo"
      this.countdownText = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
      setTimeout(() => { this.incrementer() }, 1000)
    }
  }

  onSubmit(newHeroEmail) {
    this.subError = false
    this.subSuccess = false
    this.subMsg = ''

    this._auth.addToHeroList({ email : newHeroEmail }).take(1)
      .subscribe( 
        data => {
          this.subSuccess = true
          this.subMsg = 'We\'ll let you know when Hero launches!';
      },
        error => {
          this.subError = true
          console.log(error)
          if (error.status == 400) {
            this.subMsg = 'That email has already been added!';
          } else {
            this.subMsg = 'There was a server error adding your email.';
          }
        }
      )
  }

  private goHero() : void {
    // Is user logged in?
    if (this._auth.getUser().isLoggedIn != true) {
      this.showLoginModal = true
    } else {
      this.showHeroSubModal = true
      this.angulartics.eventTrack.next({ action: 'heroSubInterest', properties: { category: 'heroFeature', label: 'attempt' }})
    }
  }
}