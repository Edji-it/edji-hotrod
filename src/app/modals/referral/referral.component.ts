import { Subscription } from 'rxjs/Rx';
import { Project } from '../../shared/datatypes';
import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { UtilToolService, ProjectService, AuthService } from './../../shared'
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
  private referralCouponCopy: any = {}
  private alertObject = {
    show: false,
    type: "",
    message: ""
  }

  @Input() private showReferral: boolean
  @Output() private hideReferral: EventEmitter<boolean> = new EventEmitter()
  @Output() private exerciseCoupon: EventEmitter<any> = new EventEmitter()

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _util: UtilToolService,
    private _projects: ProjectService,
    private _auth: AuthService
  ) {
    
  }

  ngOnInit() {
    // Let's ask the db how many referrals this user has through the auth service
    this.subscriptions.push(
      this._auth.getReferralProgress(this._auth.getUser()._id).subscribe((userReferrals) => {
        // Set the current number of referrals and build our array of objects
        this.numberReferrals = userReferrals.users_referred.length - 1
        // Count if you were referred by another user, add this to the number of referrals
        if (this._auth.getUser().referred_by && this._auth.getUser().referred_by.length > 0) {
          this.numberReferrals += 1
        }
        let maximumReferral = 5
        for (let i=0;i<maximumReferral;i++) {
          if (i <= this.numberReferrals) {
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
        if (this.numberReferrals > -1) {
          // calculate and set the discount
          let discount = ((this.numberReferrals + 1) * 20)
          // this.referralBlocks[this.numberReferrals].discount = discount
          // Set the discount text values (header, text, and button)
          switch (this.numberReferrals) {
            case 0:
              this.referralCouponCopy.header = '1 Referral in the Bag!'
              this.referralCouponCopy.text = "You've unlocked 20% off. Use it now or go for an even bigger deal."
              this.referralCouponCopy.buttonText = 'Get Hero 20% Off'
              break
            case 4:
              this.referralCouponCopy.header = 'Congratulations'
              this.referralCouponCopy.text = 'Hero is all yours! With great power comes great engagement.'
              this.referralCouponCopy.buttonText = 'Redeem Free Year'
              break
            default:
              this.referralCouponCopy.header = (this.numberReferrals + 1) + ' Referrals in the Bag!'
              this.referralCouponCopy.text = "You've unlocked " + discount + "% off. Use it now or go for an even bigger deal."
              this.referralCouponCopy.buttonText = 'Get Hero ' + discount + '% Off'
          }
        }
        // Set the referral code for copying and sharing
        this.referralCode = userReferrals.code
        // Set the link for the url for referral purposes
        let origin = location.origin.includes('localhost') ? location.origin + "/#" : location.origin
        this.referralLink = origin + "/?r=" + this.referralCode
      }, (err) => {
        console.error(err)
        this.alertObject = {
          show: true,
          type: "alert-danger",
          message: "We had some trouble getting your referrals, it might be our fault"
        }
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }

  private closeModal() {
    this.showReferral = false
    this.hideReferral.emit(false)
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
    setTimeout(() => {
      this.alertObject = {
        show: true,
        type: "alert-success",
        message: "Your referral link was copied to your clipboard"
      }
    }, 500)
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
    switch(this.numberReferrals) {
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