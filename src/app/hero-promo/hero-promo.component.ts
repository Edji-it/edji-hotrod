import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { Angulartics2 } from 'angulartics2';

import { AuthService } from '../shared'

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

  private subscriptions: Subscription[] = []

  constructor(private _auth: AuthService, private route: ActivatedRoute, private _router: Router, private angulartics: Angulartics2) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
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