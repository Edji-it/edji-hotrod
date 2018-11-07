import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

// Project Dependencies
import { AuthService } from '../_services';
import { User } from '../shared/datatypes';
import { Subscription } from 'rxjs';
@Component({
  selector: 'hero-pricing',
  templateUrl: './hero-pricing.component.pug',
  styleUrls: ['./hero-pricing.component.scss']
})
export class HeroPricingComponent implements OnInit {

  public user = {}
  public showLoginModal: boolean
  public showHeroSubModal: boolean

  public featureValues = [
    {
      name: "Unlimited Readings, students, comments",
      free: true
    },
    {
      name: "Reader Management: Leaderboard, Firefeed",
      free: true
    },
    {
      name: "Heat Vision",
      free: true
    },
    {
      name: "PDF/Image Upload",
      free: true
    },
    {
      name: "Emoji and Text Comments",
      free: true
    },
    {
      name: "Custom Group Control",
      free: false
    },
    {
      name: "Reading Recap/Feedback",
      free: false
    },
    {
      name: "Audio Comments",
      free: false
    },
    {
      name: "Questions",
      free: false
    },
    {
      name: "Replies/discussion tools",
      free: false
    }
  ]

  private subscriptions: Subscription[] = []

  constructor(public _router: Router, private _auth: AuthService) { }

  ngOnInit() {
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe((user) => {
          this.user = user
      }),
    )
  }

  goHero(): void {
    if (this._auth.getUser().isLoggedIn) {
      this.showHeroSubModal = true
    } else {
      this.showLoginModal = true
    }
  }
}