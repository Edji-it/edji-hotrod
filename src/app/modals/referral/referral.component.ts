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
        if (this.numberReferrals > -1) {
          // calculate the discount
          this.referralBlocks[this.numberReferrals].discount = ((this.numberReferrals + 1) * 20)
          // Set the discount text
          
        }
        // this.referralBlocks = [
        //   true,
        //   true,
        //   true,
        //   true,
        //   true
        // ]
        console.log(this.referralBlocks)
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