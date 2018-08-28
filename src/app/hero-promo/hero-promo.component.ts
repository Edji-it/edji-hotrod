import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService } from '../_services'

@Component({
  selector: 'app-hero-promo',
  templateUrl: './hero-promo.component.pug',
  styleUrls: ['./hero-promo.component.scss']
})
export class HeroPromoPageComponent implements OnInit, OnDestroy {

  public countdownDate
  public countdownText: string
  public countdownOver: boolean
  public subMsg : string
  public subError: boolean
  public subSuccess: boolean
  public cancelGetPriceCall: boolean = false

  // modal vars
  public showLoginModal: boolean
  public showHeroSubModal: boolean
  public showRequestAcademyModal: boolean
  public loginModalHeader: string = "Please log in or register"

  private subscriptions: Subscription[] = []

  constructor(
      private _auth: AuthService, 
      private route: ActivatedRoute, 
      public _router: Router, 
      private angulartics: Angulartics2
    ) { }

  ngOnInit() {
    // Workaround for handling "jump to" fragment/anchor
    if (this.route.snapshot.fragment) {
      let startEl = document.getElementById(this.route.snapshot.fragment)
      startEl && startEl.scrollIntoView()
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }

  public goHero() : void {
    // Is user logged in?
    if (this._auth.getUser().isLoggedIn != true) {
      this.showLoginModal = true
    } else {
      this.showHeroSubModal = true
      this.angulartics.eventTrack.next({ action: 'heroSubInterest', properties: { category: 'heroFeature', label: 'attempt' }})
    }
  }
}