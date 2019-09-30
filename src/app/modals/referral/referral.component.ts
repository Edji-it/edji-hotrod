import { Subscription } from 'rxjs'
import { Router } from '@angular/router'
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { take } from 'rxjs/operators'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { Project, User } from '../../shared/datatypes'
import { AuthService, UtilToolService, ProjectService, ReadingService } from './../../_services'

@Component({
  selector: 'referral-modal',
  templateUrl: './referral.component.pug',
  styleUrls: ['./referral.component.scss'],
})
export class ReferralModalComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []
  private referralLink: string
  private referralCode: string

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

  public showModal: boolean

  private user: User

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
   * Depending on the referral square, return the icon name to display
   * @param index is the position on the referral squares where a user has completed a referral
   */
  public getReferralIcon(index: number) {
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
  public useCoupon() {
    this.exerciseCoupon.emit(this.getCouponCode())
  }

  public closeAlert() {
    this.alertObject = {
      show: false,
      type: '',
      message: '',
    }
  }
}
