import { AuthService } from '../shared';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hero-promo',
  templateUrl: './hero-promo.component.html',
  styleUrls: ['./hero-promo.component.scss']
})
export class HeroPromoComponent implements OnInit {

  private countDownDate
  private countDownText: string
  private subMsg : string
  private subError: boolean
  private subSuccess: boolean

  constructor(private _auth: AuthService) { }

  ngOnInit() {
    this.countDownDate = new Date("Aug 15, 2017 05:00:00").getTime()

    // kick off countdown
    this.incrementer()
  }

  private incrementer() : void {
    // Get todays date and time
    var now = new Date().getTime();

    // Find the distance between now an the count down date
    var distance = this.countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // If the count down is finished, handle it
    if (distance < 0) {
      // clearInterval(this.intervalVar);
      this.countDownText = "0d 0h 0m 0s"
    } else {
      // Display the result in the element with id="demo"
      this.countDownText = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
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

}