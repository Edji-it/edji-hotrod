import { Router, ActivatedRoute } from '@angular/router'
import { Component, OnInit, OnDestroy } from '@angular/core'
import { Store } from '@ngrx/store'

// Project Dependencies
import { AuthService, CopyService } from '../_services'
import { Subscription } from 'rxjs'
import { User } from '../shared/datatypes'
import { Angulartics2 } from 'angulartics2'
import { AppState } from './../_reducers'
import { IncrementMetric } from '../_reducers/metrics.reducers'
import { map, take } from 'rxjs/operators'
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
  // Personal Hero license sitewide offer
  public offerDetails: string

  public featureValues = [
    {
      name: 'Complete Library History',
      free: false,
      free_override: '<span class="small">2</span>',
      hero_override: '<span class="small">Unlimited</span>',
      info: {
        heading: 'Active Readings',
        description:
          "<h3>Edji Free</h3><p>As an Edji Free user, you have access to your two most recent readings to create groups and assign them to students. Once you create a third reading, your oldest Active Readings will be frozen and archived. Frozen readings cannot be commented on or copied, but can be unlocked at any time by going Hero.</p><br/><h3>Edji Hero</h3><p>Hero Teachers have access to all readings that they’ve created and can access their student's comments and discussions whenever they need it.</p>",
      },
    },
    {
      name: 'Reader Management: Leaderboard, Firefeed',
      free: true,
      info: {
        heading: 'Reader Management',
        description:
          'Getting an entire class to read together is no easy feat, so we make sure that you can stay on top of your classes engagement with the Fire Feed to see new comments, and the Reader List to keep track of what each reader is doing.',
        image: '/assets/images/pricing/fire-feed.png',
      },
    },
    {
      name: 'Heat Vision',
      free: true,
      info: {
        heading: 'Heat Vision',
        description:
          'Heat vision is the core of Edji: Showing teachers where students are engaging with their text. See what was interesting to your readers, or what they might have skipped. Show off Heat Vision to help your students see what their peers were thinking',
        image: '/assets/images/pricing/heat-vision.gif',
      },
    },
    {
      name: 'PDF/Image Upload',
      free: true,
      info: {
        heading: 'Reading Customization',
        description:
          'Engage your students with more than just words on the screen. Liven up your readings with images, GIFs, and PDF’s that you can build right into your lesson.',
        image: '/assets/images/pricing/image-comments.png',
      },
    },
    {
      name: 'Audio, Emoji and Text Comments',
      free: true,
      info: {
        heading: 'Emoji and Text Comments',
        description:
          'Real reading engagement is powerful, emotional and moving. Have your students engage with the text and express their thoughts for you to see, read or listen to.',
        image: '/assets/images/pricing/comments.png',
      },
    },
    {
      name: 'Custom Group Control',
      free: true,
      info: {
        heading: 'Custom Group Control',
        description:
          'Get full control of your reading groups by leaving Instructions, choosing comment types, and creating custom group codes!',
        image: '/assets/images/pricing/custom-group.png',
      },
    },
    {
      name: 'Questions',
      free: true,
      info: {
        heading: 'Questions',
        description:
          'Insert Questions into your reading to call out important details or make your students think about the points made in the text. While getting the tools to watch your students’ answers roll in.',
        image: '/assets/images/hero-promo-question.png',
      },
    },
    {
      name: 'Discussion Tools',
      free: true,
      info: {
        heading: 'Discussion Tools',
        description:
          'Unlock the ability to open up discussion in your Edji readings with comment replies. Leave feedback, ask further questions, and get your students talking!',
        image: '/assets/images/pricing/replies.png',
      },
    },
    {
      name: 'Student Analysis Tools',
      free: false,
      info: {
        heading: 'Student Analysis Tools',
        description:
          'Analyze how your students read using Hero’s unique student analysis tools. See each students reading stats with the Reading Recap, and provide timely and effective feedback with the Feedback Tool.',
        image: '/assets/images/pricing/recap.png',
      },
    },
    {
      name: 'Custom Codes',
      free: false,
      info: {
        heading: 'Custom Group Codes',
        description: 'Give your Groups Custom codes for easy access, reading scavenger hunts and more!',
        image: '/assets/images/pricing/custom-code.png',
      },
    },
  ]

  private subscriptions: Subscription[] = []

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
      }),
      this._copy.activePromotions.subscribe(promo => {
        if (promo.offerDetails) {
          this.offerDetails = promo.offerDetails
        }
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
}
