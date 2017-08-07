import { AuthService } from '../shared';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hero-pricing',
  templateUrl: './hero-pricing.component.html',
  styleUrls: ['./hero-pricing.component.scss']
})
export class HeroPricingComponent implements OnInit {

  private showLoginModal: boolean
  private showHeroSubModal: boolean

  constructor(private _router: Router, private _auth: AuthService) { }

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