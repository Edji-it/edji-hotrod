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
        this.numberReferrals = 1
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

  private copyReferralCode() {
    let selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    selBox.value = this.referralLink
    document.body.appendChild(selBox)
    selBox.focus()
    selBox.select()
    document.execCommand('copy')
    document.body.removeChild(selBox)
  }

  private shareReferralCode(shareMedium: string) {
    switch(shareMedium) {
      case 'email':
        console.log('email')
        break
      case 'twitter':
        console.log('twitter')
        break
      case 'facebook':
        console.log('facebook')
        break
      default:
        this.copyReferralCode()
    }
  }

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