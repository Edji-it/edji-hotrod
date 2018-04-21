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

  private referralLink: string
  private referralCode: string
  private referralBlocks: any = []
  private numberReferrals: number
  private referralCouponCopy: any = {}

  @Input() private showReferral: boolean
  @Output() private hideReferral: EventEmitter<boolean> = new EventEmitter()

  private subscriptions: Subscription[] = []

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
        this.referralLink = "https://edji.it/r/" + this.referralCode
      }, (err) => {
        console.error(err)
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
  }

  /**
   * Depending on which share button is clicked, perform a certain action
   * @param shareMedium is the path the user will be using to share their referral code
   */
  private shareReferralCode(shareMedium: string) {
    switch(shareMedium) {
      case 'email':
        window.open('mailto:?subject=Go Hero on Edji With Me&body=Create%20readings%20on%20Edji%20with%20me%2C%20and%20get%2020%25%20off%20Hero%20edji.it%2Fr%2F' + this.referralCode, '_blank')
        break
      case 'twitter':
        window.open('https://twitter.com/intent/tweet?text=Create%20readings%20on%20Edji%20with%20me%2C%20and%20get%2020%25%20off%20Hero%20edji.it%2Fr%2F' + this.referralCode, '_blank')
        break
      case 'facebook':
        window.open('https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fedji.it%2Fr%2F' + this.referralCode + '&amp;src=sdkpreparse', '_blank')
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
}