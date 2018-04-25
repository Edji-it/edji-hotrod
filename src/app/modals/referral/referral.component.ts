import { Subscription } from 'rxjs/Rx';
import { Project } from '../../shared/datatypes';
import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { UtilToolService, ProjectService, AuthService, ReadingService } from './../../shared'
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'referral-modal',
  templateUrl: 'referral.component.pug',
  styleUrls: ['./referral.component.scss']
})
export class ReferralModalComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = []
  private referralLink: string
  private referralCode: string
  private referralBlocks: any = []
  private numberReferrals: number
  private referralIndex: number = -1
  private referralCouponCopy: any = {}
  private alertObject = {
    show: false,
    type: "",
    message: ""
  }
  private linkCopySuccess: boolean
  private referredByComplete: boolean 

  private showModal: boolean
  @Input()
  set showReferral(showReferral: boolean) {
    if (typeof(showReferral) !== 'undefined' && this.showModal !== showReferral) {
      this.showModal = showReferral
      if (this.showModal) {
        // Refresh the check for created readings on modal open
        this._readings.updateCreated()
      }
    } 
  }
  get showReferral(): boolean { return this.showModal }
  @Output() private hideReferral: EventEmitter<boolean> = new EventEmitter()
  @Output() private exerciseCoupon: EventEmitter<any> = new EventEmitter()

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _util: UtilToolService,
    private _projects: ProjectService,
    private _readings: ReadingService,
    private _auth: AuthService
  ) {
    
  }

  ngOnInit() {
    let user = this._auth.getUser()
    // Let's ask the db how many referrals this user has through the auth service
    this.subscriptions.push(
      this._auth.getReferralProgress(user._id).subscribe((userReferrals) => {
        // Set the current number of referrals and build our array of objects
        let completedReferrals = userReferrals.users_referred.filter(referred => {
          return referred.status == "completed"
        })
        this.numberReferrals = completedReferrals.length - 1
        this.evaluateReferralProgress(this.numberReferrals, this.referredByComplete)
        // Set the referral code for copying and sharing
        this.referralCode = userReferrals.code
        this.referralLink = location.origin + "/#/?r=" + this.referralCode
      }, (err) => {
        console.error(err)
        this.alertObject = {
          show: true,
          type: "alert-danger",
          message: "We had some trouble getting your referrals, it might be our fault"
        }
      })
    )
    // If the user was referred, we want to give them credit when they create a reading
    if (user.referred_by && user.referred_by.length > 0) {
      this.subscriptions.push(
        this._readings.currentUserReadings.subscribe((data) => {
          if (data.readings && data.readings.length > 0) {
            this.closeAlert()
            this.referredByComplete = true
            this.evaluateReferralProgress(this.numberReferrals, this.referredByComplete)
          } else {
            // Let the user know they need to create a Reading!
            this.alertObject = {
              show: true,
              type: "alert-info",
              message: "<b>Almost There</b><br/>Since you were referred by someone, just <a class='link' href='/#/new-reading'>create a reading</a> to get a stamp and earn 20% off!"
            }
          }
        })
      )
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }

  private closeModal() {
    this.showModal = false
    this.hideReferral.emit(false)
  }

  /**
   * Evaluates Referral Progress
   * - Updates display objects
   */
  private evaluateReferralProgress(referralIndex: number, referredByComplete: boolean) : void {
    // Count if you were referred by another user AND completed a reading, add this to the number of referrals
    if (referredByComplete) {
      referralIndex += 1
    }
    let maximumReferral = 5
    for (let i=0;i<maximumReferral;i++) {
      if (i <= referralIndex) {
        this.referralBlocks[i] = {
          referred: true
        }
      } else {
        this.referralBlocks[i] = {
          referred: false
        }
      }
    }
    // If the user has 1 or more referrals
    // Note: for purposes of lining up with the array, we subtract 1 from the user_referrals length above before we do anything else
    if (referralIndex > -1) {
      // calculate and set the discount
      let discount = ((referralIndex + 1) * 20)
      if (discount > 100) { discount = 100 }
      // Set the discount text values (header, text, and button)
      if (referralIndex >= 4) {
          this.referralCouponCopy.header = 'Congratulations'
          this.referralCouponCopy.text = 'Hero is all yours! With great power comes great engagement.'
          this.referralCouponCopy.buttonText = 'Redeem Free Year'
      } else {
          this.referralCouponCopy.header = (referralIndex + 1) + ' Referral' + (referralIndex >= 1 ? 's' : '') + ' in the Bag!'
          this.referralCouponCopy.text = "You've unlocked " + discount + "% off. Use it now or go for an even bigger deal."
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

  /**
   * Depending on which share button is clicked, perform a certain action
   * @param shareMedium is the path the user will be using to share their referral code
   */
  private shareReferralCode(shareMedium: string) {
    switch(shareMedium) {
      case 'email':
        window.open('mailto:?subject=Go Hero on Edji With Me&body=Create%20readings%20on%20Edji%20with%20me%2C%20and%20get%2020%25%20off%20Hero%20' + encodeURIComponent(this.referralLink), '_blank')
        break
      case 'twitter':
        window.open('https://twitter.com/intent/tweet?text=Create%20readings%20on%20Edji%20with%20me%2C%20and%20get%2020%25%20off%20Hero%20' + encodeURIComponent(this.referralLink), '_blank')
        break
      case 'facebook':
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(this.referralLink) + '&amp;src=sdkpreparse', '_blank')
        break
      default:
        this.copyReferralCode()
    }
  }

  /**
   * Depending on the referral square, return the icon name to display
   * @param index is the position on the referral squares where a user has completed a referral
   */
  private getReferralIcon(index: number) {
    switch(index) {
      case 0:
        return "icon-bam"
      case 1:
        return "icon-splat"
      case 2:
        return "icon-biff"
      case 3:
        return "icon-pow"
      case 4:
        return "icon-hero"
    }
  }

  /**
   * Depending on the number of referrals the user has, get the code
   */
  private getCouponCode() {
    // A user may refer more than 5, but they get the same discount
    let couponNo = this.numberReferrals > 4 ? 4 : this.numberReferrals
    switch(couponNo) {
      case 0:
        return "HOTROD_HERO_ONE5TH"
      case 1:
        return "HOTROD_HERO_24BUCKS"
      case 2:
        return "HOTROD_HERO_36BIGONES"
      case 3:
        return "HOTROD_HERO_4FIFTHS"
      case 4:
        return "HOTROD_HERO_REFERMASTER"
    }
  }

  // When the user chooses to use the coupon, we'll need to close this modal and pass along the coupon code to the hero subscription modal
  private useCoupon() {
    this.exerciseCoupon.emit(this.getCouponCode())
  }

  private closeAlert() {
    this.alertObject = {
      show: false,
      type: "",
      message: ""
    }
  }
}