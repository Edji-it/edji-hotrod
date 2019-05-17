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
  selector: 'referral-modal',
  templateUrl: './referral.component.pug',
  styleUrls: ['./referral.component.scss'],
})
export class ReferralModalComponent implements OnInit, OnDestroy {
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
  public modalCopy: {
    title: string
    body: string
  } = {
    title: 'Give Hero, Get Hero',
    body: 'Share your unique referral link to give <i>and</i> unlock Hero discounts.'
  }
  public linkCopySuccess: boolean
  private referredByComplete: boolean

  public showModal: boolean

  private user: User
  public reading: Reading

  @Input() public shareReading: string
  @Input()
  set showReferral(show: boolean) {
    if (typeof show !== 'undefined' && this.showModal !== show) {
      this.showModal = show
      if (this.showModal) {
        // fire an analytic event here for tracking purposes
        this.angulartics.eventTrack.next({
          action: 'referral_openModal',
          properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
        })
        // Get user's referral status
        this.getUserReferralStatus()
        // Refresh the check for created readings on modal open
        this._readings.updateCreated(this.user)
        // set up the reading link and detail for modal copy
        if (this.shareReading) {
          console.log(this.shareReading)
          this.referralLink = `${location.origin}/#/discover?preview=${this.shareReading}`
          this.socialLinks = this.formatLinks(this.referralLink, true)
          this.getReadingDetails()
        }
      }
    }
  }
  get showReferral(): boolean {
    return this.showModal
  }

  @Output() private hideReferral: EventEmitter<boolean> = new EventEmitter()
  @Output() private exerciseCoupon: EventEmitter<any> = new EventEmitter()

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _util: UtilToolService,
    private _projects: ProjectService,
    private _readings: ReadingService,
    private _auth: AuthService,
    private angulartics: Angulartics2,
  ) {}

  ngOnInit() {
    this.user = this._auth.getUser()
    // If the user was referred, we want to give them credit when they create a reading
    if (this.user.referred_by && this.user.referred_by.length > 0) {
      this.subscriptions.push(
        this._readings.currentUserReadings.subscribe(data => {
          if (data.readings && data.readings.length > 0) {
            this.closeAlert()
            this.referredByComplete = true
            this.evaluateReferralProgress(this.numberReferrals, this.referredByComplete)
          } else {
            // Let the user know they need to create a Reading!
            this.alertObject = {
              show: true,
              type: 'alert-info',
              message:
                "<b>Almost There</b><br/>Since you were referred by someone, just <a class='link' href='/#/new-reading'>create a reading</a> to get a stamp and earn 20% off!",
            }
          }
        }),
      )
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  public closeModal() {
    // drop the showRefer queryParam on close
    if (this.shareReading) {
      this.route.queryParams.subscribe((qp) => {
        let params = { ...qp }
        delete params['showRefer']
        this.router.navigate([], { queryParams: params })
      })
    }
    this.showModal = false
    this.hideReferral.emit(false)
  }

  /**
   * Get User's Referral Status
   * - Retrieves: referral code, users referred
   * - Causes re-calc of referral stamps
   */
  private getUserReferralStatus() {
    let user = this._auth.getUser()
    this._auth
      .getReferralProgress(user._id)
      .pipe(take(1))
      .subscribe(
        (userReferrals: any) => {
          // Set the current number of referrals and build our array of objects
          let completedReferrals = userReferrals.users_referred.filter(referred => {
            return referred.status == 'completed'
          })
          this.numberReferrals = completedReferrals.length - 1
          this.evaluateReferralProgress(this.numberReferrals, this.referredByComplete)
          // Set the referral code for copying and sharing
          this.referralCode = userReferrals.code
          this.referralLink = location.origin + '/#/?r=' + this.referralCode
          this.socialLinks = this.formatLinks(this.referralLink)
        },
        err => {
          console.error(err)
          this.alertObject = {
            show: true,
            type: 'alert-danger',
            message: 'We had some trouble getting your referrals, it might be our fault',
          }
        },
      )
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

  /**
   * Copies the referral link to the user's clipboard
   */
  private copyReferralCode() {
    // Create a new textarea element that we'll not make visible
    let selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    // Set the value of the textarea to be the share link with their referral code
    selBox.value = this.referralLink
    document.body.appendChild(selBox)
    // Focus on the element text, select the text, and use a copy command
    selBox.focus()
    selBox.select()
    document.execCommand('copy')
    // Take this hidden element out of the DOM
    document.body.removeChild(selBox)
    // Show a success alert when the code is copied to their clipboard
    this.linkCopySuccess = true
    setTimeout(() => {
      this.linkCopySuccess = false
    }, 2000)
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
  private trackReferralCode(shareMedium: string) {
    // fire an analytic event here for tracking purposes
    if (shareMedium === 'copy') {
      this.copyReferralCode()
    }
    this.angulartics.eventTrack.next({
      action: 'referral_' + shareMedium + '_shareLink',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }

  /**
   * Depending on the referral square, return the icon name to display
   * @param index is the position on the referral squares where a user has completed a referral
   */
  private getReferralIcon(index: number) {
    switch (index) {
      case 0:
        return 'icon-bam'
      case 1:
        return 'icon-splat'
      case 2:
        return 'icon-biff'
      case 3:
        return 'icon-pow'
      case 4:
        return 'icon-hero'
    }
  }

  /**
   * Depending on the number of referrals the user has, get the code
   */
  private getCouponCode() {
    // A user may refer more than 5, but they get the same discount
    let couponNo = this.referralIndex > 4 ? 4 : this.referralIndex
    switch (couponNo) {
      case 0:
        return 'HOTROD_HERO_ONE5TH'
      case 1:
        return 'HOTROD_HERO_24BUCKS'
      case 2:
        return 'HOTROD_HERO_36BIGONES'
      case 3:
        return 'HOTROD_HERO_4FIFTHS'
      case 4:
        return 'HOTROD_HERO_REFERMASTER'
    }
  }

  // When the user chooses to use the coupon, we'll need to close this modal and pass along the coupon code to the hero subscription modal
  private useCoupon() {
    this.exerciseCoupon.emit(this.getCouponCode())
  }

  private closeAlert() {
    this.alertObject = {
      show: false,
      type: '',
      message: '',
    }
  }

  private async getReadingDetails(): Promise<void> {
    this.modalCopy.body = `Would you like to share this Reading for another teacher to use? 
      <br /> <br />This handy link will allow another teacher to use the same Reading, without accessing your Groups.`

    // need to get the reading title for the next one
    this.reading = await this._readings.get(this.shareReading).toPromise()
    this.modalCopy.title = `Send Link to ${this.reading.title}`
  }
}
