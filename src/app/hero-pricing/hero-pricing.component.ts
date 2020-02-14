import { Router, ActivatedRoute } from '@angular/router'
import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'

// Project Dependencies
import { AuthService, CopyService } from '../_services'
import { Subscription } from 'rxjs'
import { User } from '../shared/datatypes'
import { Angulartics2 } from 'angulartics2'
import { AppState } from './../_reducers'
import { IncrementMetric } from '../_reducers/metrics.reducers'
@Component({
  selector: 'hero-pricing',
  templateUrl: './hero-pricing.component.pug',
  styleUrls: ['./hero-pricing.component.scss'],
})
export class HeroPricingComponent implements OnInit {
  public user: User = <any>{}
  public showLoginModal: boolean
  public showHeroSubModal: boolean
  public showInfoModal: boolean
  public showRequestAcademyModal: boolean
  public infoModalInfo: {
    heading?: string
    description?: string
    image?: string
    free_override?: string
    hero_override?: string
  } = {}
  public isHero: boolean
  public isAcademyHero: boolean
  // Personal Hero license sitewide offer
  public offerDetails: string

  public planDetails = [
    {
      label: 'Concurrent Students',
      free: 'Unlimited :partying_face:',
      hero: 'Unlimited :partying_face:',
      academy: 'Unlimited :partying_face:',
    },
    {
      label: 'Active Readings',
      free: '2',
      hero: 'Unlimited :partying_face:',
      academy: 'Unlimited :partying_face:',
      info: {
        heading: 'Active Readings',
        description:
          "<h3>Edji Free</h3><p>As an Edji Free user, you have access to your two most recent readings to create groups and assign them to students. Once you create a third reading, your oldest Active Readings will be frozen and archived. Frozen readings cannot be commented on or copied, but can be unlocked at any time by going Hero.</p><br/><h3>Edji Hero</h3><p>Hero Teachers have access to all readings that they’ve created and can access their student's comments and discussions whenever they need it.</p>",
      },
    },
    {
      label: '',
      free: ':white_check_mark: Public Sharing and Search',
      hero: ':white_check_mark: Public Sharing and Search',
      academy: ':white_check_mark: Public Sharing and Search',
    },
    {
      label: '',
      free: ':x: Reading Recap',
      hero: ':white_check_mark: Reading Recap',
      academy: ':white_check_mark: Reading Recap',
      info: {
        heading: 'Student Analysis Tools',
        description:
          'Analyze how your students read using Hero’s unique student analysis tools. See each students reading stats with the Reading Recap, and provide timely and effective feedback with the Feedback Tool.',
        image: '/assets/images/recap.png',
      },
    },
    {
      label: '',
      free: ':x: Private Lesson Library',
      hero: ':x: Private Lesson Library',
      academy: ':white_check_mark: Private Lesson Library',
    },
  ]

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
  public formatRateLabel = (v: number) => {
    return this.academyPlans[v].plan
  }

  constructor(
    public _router: Router,
    private _auth: AuthService,
    private route: ActivatedRoute,
    private angulartics: Angulartics2,
    private store: Store<AppState>,
    private _copy: CopyService,
  ) {}

  ngOnInit() {
    // Workaround for handling "jump to" fragment/anchor
    if (this.route.snapshot.fragment) {
      let startEl = document.getElementById(this.route.snapshot.fragment)
      startEl && startEl.scrollIntoView()
    }

    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
        this.isHero = user && user.isLoggedIn && user.hero_status
      }),
      this._copy.activePromotions.subscribe(promo => {
        if (promo.offerDetails) {
          this.offerDetails = promo.offerDetails
        }
      }),
      this.route.queryParams.subscribe(params => {
        if (params['request']) {
          this.showRequestAcademyModal = params['request'] === 'academy'
        }
      }),
      // Academy Flag
      this._auth.currentAcademyState.subscribe(academyState => {
        this.isAcademyHero = academyState && academyState.academies && academyState.academies.length > 0
      }),
    )

    if (this._auth.getUser().email) {
      this.store.dispatch(new IncrementMetric('hero_page_load_count'))
    }
  }

  goHero(location?: string): void {
    if (this._auth.getUser().isLoggedIn) {
      this.showHeroSubModal = true
    } else {
      this.showLoginModal = true
    }
    this.angulartics.eventTrack.next({
      action: 'heroInterest_promoPage_' + location,
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }

  public triggerInfoModal(info: { heading: string; description: string; image: string }): void {
    this.infoModalInfo = info
    this.showInfoModal = true
  }

  public scrollTo(id: string, center?: boolean) {
    let el = document.getElementById(id)
    let options: any = { behavior: 'smooth' }
    if (center) options.block = 'center'
    el && el.scrollIntoView(options)
  }
}
