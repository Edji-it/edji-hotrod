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
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }

  private closeModal() {
    this.showReferral = false
    this.hideReferral.emit(false)
  }

  private copyReferralCode() {
    console.log(this.referralLink)
    
  }
}