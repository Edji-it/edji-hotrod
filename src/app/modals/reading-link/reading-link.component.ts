import { Subscription } from 'rxjs'
import { Router } from '@angular/router'
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { take } from 'rxjs/operators'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { Project, User, Reading } from '../../shared/datatypes'
import { AuthService, UtilToolService, ProjectService, ReadingService } from './../../_services'

@Component({
  selector: 'edji-reading-link',
  templateUrl: './reading-link.component.pug',
  styleUrls: ['./reading-link.component.scss'],
})
export class ReadingLinkModal implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []
  public referralLink: string
  private referralCode: string
  public socialLinks = {
    emailLink: '',
    twitterLink: '',
    facebookLink: '',
  }
  public referralBlocks: any = []
  public numberReferrals: number
  public referralIndex: number = -1
  public referralCouponCopy: any = {}
  public alertObject = {
    show: false,
    type: '',
    message: '',
  }
  public linkCopySuccess: boolean
  private referredByComplete: boolean
  public readingLinkMode: boolean

  public showModal: boolean

  private user: User
  public reading: Reading

  @Input('reading') public shareReading: Reading

  @Output() private closeModal: EventEmitter<boolean> = new EventEmitter()
  // @Output() private exerciseCoupon: EventEmitter<any> = new EventEmitter()

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _util: UtilToolService,
    private _projects: ProjectService,
    private _readings: ReadingService,
    private _auth: AuthService,
    private angulartics: Angulartics2,
  ) {
  }

  ngOnInit() {
    this.user = this._auth.getUser()

    this.referralLink = `${location.origin}/#/discover?preview=${this.shareReading._id}`
    this.socialLinks = this.formatLinks(this.referralLink, true)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  public close() {
    // drop the showRefer queryParam on close
    if (this.shareReading) {
      this.route.queryParams.subscribe((qp) => {
        let params = { ...qp }
        delete params['showRefer']
        this.router.navigate([], { queryParams: params })
      })
    }
    this.readingLinkMode = false
    this.showModal = false
    this.closeModal.emit(false)
  }

  /**
   * Evaluates Referral Progress
   * - Updates display objects
   */
  private evaluateReferralProgress(referralIndex: number, referredByComplete: boolean): void {
    // Count if you were referred by another user AND completed a reading, add this to the number of referrals
    if (referredByComplete) {
      referralIndex += 1
    }
    let maximumReferral = 5
    for (let i = 0; i < maximumReferral; i++) {
      if (i <= referralIndex) {
        this.referralBlocks[i] = {
          referred: true,
        }
      } else {
        this.referralBlocks[i] = {
          referred: false,
        }
      }
    }
    // If the user has 1 or more referrals
    // Note: for purposes of lining up with the array, we subtract 1 from the user_referrals length above before we do anything else
    if (referralIndex > -1) {
      // calculate and set the discount
      let discount = (referralIndex + 1) * 20
      if (discount > 100) {
        discount = 100
      }
      // Set the discount text values (header, text, and button)
      if (referralIndex >= 4) {
        this.referralCouponCopy.header = 'Congratulations'
        this.referralCouponCopy.text = 'Hero is all yours! With great power comes great engagement.'
        this.referralCouponCopy.buttonText = 'Redeem Free Year'
      } else {
        this.referralCouponCopy.header =
          referralIndex + 1 + ' Referral' + (referralIndex >= 1 ? 's' : '') + ' in the Bag!'
        this.referralCouponCopy.text =
          "You've unlocked " + discount + '% off. Use it now or go for an even bigger deal.'
        this.referralCouponCopy.buttonText = 'Get Hero ' + discount + '% Off'
      }
    }
    this.referralIndex = referralIndex
  }

  private formatLinks(referralLink: string, shareReading?: boolean) {
    let socialLinks = {
      emailSubject: 'Go Hero on Edji With Me',
      emailBody: 'Create%20readings%20on%20Edji%20with%20me%2C%20and%20get%2020%25%20off%20Hero%20',
      twitter: 'Create%20readings%20on%20Edji%20with%20me%2C%20and%20get%2020%25%20off%20Hero%20',
      facebook: `https://www.facebook.com/sharer/sharer.php?u=`
    }
    if (shareReading) {
      socialLinks.emailSubject = 'Check Out This Reading'
      socialLinks.emailBody = 'I%20thought%20you%20would%20like%20this%20reading%2E%20Check%20it%20out%on%20Edji%20'
      socialLinks.twitter = 'I%20thought%20you%20would%20like%20this%20reading%2E%20Check%20it%20out%on%20Edji%20'
    }
    let email = `mailto:?subject=${socialLinks.emailSubject}&body=${socialLinks.emailBody}`
    let twitter = `https://twitter.com/intent/tweet?text=${socialLinks.twitter}`

    return {
      emailLink:
        `${email}${encodeURIComponent(referralLink)}`,
      twitterLink:
        `${twitter}${encodeURIComponent(referralLink)}`,
      facebookLink:
        `${socialLinks.facebook}${encodeURIComponent(referralLink)}&amp;src=sdkpreparse`
    }
  }

  /**
   * Depending on which share button is clicked, perform a certain action
   * @param shareMedium is the path the user will be using to share their referral code
   */
  public trackReferralLink(shareMedium: string) {
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action: 'referral_' + shareMedium + '_shareLink',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }

  public closeAlert() {
    this.alertObject = {
      show: false,
      type: '',
      message: '',
    }
  }

}
