import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

// Project Dependencies
import { AuthService } from '../_services';
@Component({
  selector: 'hero-pricing',
  templateUrl: './hero-pricing.component.html',
  styleUrls: ['./hero-pricing.component.scss']
})
export class HeroPricingComponent implements OnInit {

  public showLoginModal: boolean
  public showHeroSubModal: boolean

  constructor(public _router: Router, private _auth: AuthService) { }

  ngOnInit() {
  }

  goHero(): void {
    if (this._auth.getUser().isLoggedIn) {
      this.showHeroSubModal = true
    } else {
      this.showLoginModal = true
    }
  }
}