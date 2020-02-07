import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService } from '../_services'

@Component({
  selector: 'app-hero-promo',
  templateUrl: './hero-promo.component.pug',
  styleUrls: ['./hero-promo.component.scss'],
})
export class HeroPromoPageComponent implements OnInit, OnDestroy {
  public countdownDate
  public countdownText: string
  public countdownOver: boolean
  public subMsg: string
  public subError: boolean
  public subSuccess: boolean
  public cancelGetPriceCall: boolean = false

  // modal vars
  public showLoginModal: boolean
  public showHeroSubModal: boolean
  public showRequestAcademyModal: boolean
  public loginModalHeader: string = 'Please log in or register'

  private subscriptions: Subscription[] = []

  public academyPlans = [
    {
      plan: 'Intro Plan',
      size: 'Up to 5 Teachers',
      prevCost: '$300',
      cost: '$180',
      planDetail: 'A small group of teachers piloting Edji for their school',
    },
    {
      plan: 'Team Plan',
      size: 'Up to 25 Teachers',
      prevCost: '$1500',
      cost: '$690',
      planDetail: 'Perfect for departments and PLCs',
    },
    {
      plan: 'Small School',
      size: 'Up to 50 Teachers',
      prevCost: '$3000',
      cost: '$990',
      planDetail: 'Great for a small school or large department',
    },
    {
      plan: 'Large School',
      size: 'Whole School',
      prevCost: '$7500',
      cost: '$1990',
      planDetail: 'Unlimited number of teachers at a single site',
    },
    {
      plan: 'Small District',
      size: 'Up to 6 Schools',
      prevCost: '$22800',
      cost: '$4900',
      planDetail: 'Unlimited Edji for 6 or less schools in a single district',
    },
    {
      plan: 'Large District',
      size: 'Whole District',
      prevCost: '',
      cost: 'Contact Us',
      planDetail: 'Unlimited Edji for an entire district',
    },
  ]

  public sliderPos: number = 1

  constructor(
    public _auth: AuthService,
    private route: ActivatedRoute,
    public _router: Router,
    private angulartics: Angulartics2,
  ) {}

  ngOnInit() {
    // Workaround for handling "jump to" fragment/anchor
    if (this.route.snapshot.fragment) {
      let startEl = document.getElementById(this.route.snapshot.fragment)
      startEl && startEl.scrollIntoView()
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  public goHero(location?: string): void {
    // Is user logged in?
    if (this._auth.getUser().isLoggedIn != true) {
      this.showLoginModal = true
    } else {
      this.showHeroSubModal = true
    }
    this.angulartics.eventTrack.next({
      action: 'heroInterest_promoPage_' + location,
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }

  // analytic event handler
  public spotlightTracking(feature?: string): void {
    this.angulartics.eventTrack.next({
      action: 'heroSpotlight_' + feature + '_clicked',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }

  // shows the modal and fires an analytics event for us
  public requestAcademyModalShow(location?: string): void {
    this.showRequestAcademyModal = true
    this.angulartics.eventTrack.next({
      action: 'academyRequest_promoPage_' + location + '_opened',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }
}
