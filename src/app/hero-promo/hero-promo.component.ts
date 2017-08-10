import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { AuthService } from '../shared';

@Component({
  selector: 'app-hero-promo',
  templateUrl: './hero-promo.component.html',
  styleUrls: ['./hero-promo.component.scss']
})
export class HeroPromoComponent implements OnInit {

  private countdownDate
  private countdownText: string
  private countdownOver: boolean
  private subMsg : string
  private subError: boolean
  private subSuccess: boolean
  private showLoginModal: boolean
  private showHeroSubModal: boolean

  // Default to count that offers $41/yr, approx end of promo
  private heroCount: number = 1366
  private heroFullPrice: number = 6000
  private heroPromoStart: number = 100
  private priceIncrement: number = 3

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
    
    this.countdownDate = new Date("Aug 15, 2017 05:00:00").getTime()
    // kick off countdown
    this.incrementer()
    // Conitnuously check for Hero Count
    this.getHeroCount()
  }

  /**
   * @returns amount off in cents
   */
  private earlyAmountOff(): number {
    return this.heroFullPrice - (this.heroCount * 3) - this.heroPromoStart
  }

  private getPrice(): number {
    return (this.heroFullPrice - this.earlyAmountOff())/100
  }

  private getHeroCount(): void {
    this._auth.getHeroCount()
      .toPromise()
      .then( 
        data => {
          if (data.count) {
            this.heroCount = data.count
          }
          setTimeout(() => {
            this.getHeroCount()
          }, 2000)
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
          console.log(data)
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
    }
  }
}