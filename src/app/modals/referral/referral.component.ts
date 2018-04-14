import { Subscription } from 'rxjs/Rx';
import { Project } from '../../shared/datatypes';
import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { UtilToolService, ProjectService } from './../../shared'
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'referral-modal',
  templateUrl: 'referral.component.pug',
  styleUrls: ['./referral.component.scss']
})
export class ReferralModalComponent implements OnInit, OnDestroy {

  private referralLink: string
  private referralCode: string
  private referralBlocks: any[]

  @Input() private showReferral: boolean
  @Output() private hideReferral: EventEmitter<boolean> = new EventEmitter()

  private subscriptions: Subscription[] = []

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _util: UtilToolService,
    private _projects: ProjectService
  ) {
    
  }

  ngOnInit() {
    // Set the referral code for copying and sharing
    this.referralCode = "CODE"
    // Set the link for the url for referral purposes
    this.referralLink = "https://edji.it/r/" + this.referralCode

    this.referralBlocks = [
      false,
      false,
      false,
      false,
      false
    ]
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
}