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
  public showInfoModal: boolean
  public infoModalInfo: { heading?: string, description?: string, image?: string } = {}

  public featureValues = [
    {
      name: "Unlimited Readings, students, comments",
      free: true,
      info: {
        heading: "Unlimited Readings, Students Comments",
        description: "Edji loves reading, so why would we limit how much you can read? Every Edji user can create as many readings to share with as many readers as they want. No storage, class size or engagement limits, ever.",
        image: ""
      }
    },
    {
      name: "Reader Management: Leaderboard, Firefeed",
      free: true,
      info: {
        heading: "Reader Management",
        description: "Getting an entire class to read together is no easy feat, so we make sure that you can stay on top of your classes engagement with the Fire Feed to see new comments, and the Reader List to keep track of what each reader is doing.",
        image: ""
      }
    },
    {
      name: "Heat Vision",
      free: true,
      info: {
        heading: "Heat Vision",
        description: "Heat vision is the core of Edji: Showing teachers where students are engaging with their text. See what was interesting to your readers, or what they might have skipped. Show off Heat Vision to help your students see what their peers were thinking",
        image: ""
      }
    },
    {
      name: "PDF/Image Upload",
      free: true,
      info: {
        heading: "Reading Customization",
        description: "Engage your students with more than just words on the screen. Liven up your readings with images, GIFs, and PDF’s that you can build right into your lesson.",
        image: ""
      }
    },
    {
      name: "Emoji and Text Comments",
      free: true,
      info: {
        heading: "Emoji and Text Comments",
        description: "Real reading engagement is powerful, emotional and moving. Have your students engage with the text and leave behind their thoughts and feelings for you to see.",
        image: ""
      }
    },
    {
      name: "Custom Group Control",
      free: false,
      info: {
        heading: "Custom Group Control",
        description: "Get full control of your reading groups by leaving Instructions, choosing comment types, and creating custom group codes!",
        image: ""
      }
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

  public triggerInfoModal(info: { heading: string, description: string, image: string }): void {
    this.infoModalInfo = info
    this.showInfoModal = true
  }
}