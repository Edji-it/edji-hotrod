import { Title } from '@angular/platform-browser'
import { Component, ElementRef, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'

// Project Dependencies
import { AuthService, ReadingService, ProjectService, LockerService, MessageService, CopyService } from '../_services'
import { User } from './../shared/datatypes'

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'dashboard', // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./dashboard.component.scss'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './dashboard.component.pug',
})
export class DashboardComponent implements OnInit {
  // Set our default values
  private subscriptions: Subscription[] = []
  public currentUser: User
  public mobileShowJoined: boolean = true
  public showUserDetailsModal: boolean = false

  // Tool Tip variables
  public toolTipsContent: any[]
  public toolTipStepNo: number = 1

  // TypeScript public modifiers
  constructor(
    public _router: Router,
    private _auth: AuthService,
    private _title: Title,
    private _locker: LockerService,
    private route: ActivatedRoute,
    private _messages: MessageService,
    private _copy: CopyService,
  ) {
    // this makes the window always render scrolled to the top
    this._router.events.subscribe(() => {
      window.scrollTo(0, 0)
    })
  }

  ngOnInit() {
    this.currentUser = this._auth.getUser()

    this._title.setTitle('Edji | Dashboard')

    // Ask teachers "Where did you hear about us?"
    if (!this.currentUser.isStudent && (!this.currentUser.heard_about_us || !this.currentUser.heard_about_us.source)) {
      // Check if user was created on/after September 21th (users prior to modalUpdateDate should not see modal)
      let createdDate = new Date(this.currentUser.createdAt)
      let modalUpdateDate = new Date('2019-09-20')
      if (createdDate > modalUpdateDate) {
        this.showUserDetailsModal = true
      }
    }
    // Set tutorial content
    this.toolTipsContent = [
      {
        title: 'The Dashboard',
        image: '/assets/dashboard-tooltips/logo.png',
        body: 'Welcome to your Dashboard, your Edji hub. Here, you\'ll find all the readings you have created or are reading!',
      },
      {
        title: 'The Read Tab',
        image: '/assets/dashboard-tooltips/lightning-code.png',
        body: 'Readings that you\'ve <b>joined</b> to read. Join a new one by using a group code!',
      },
      {
        title: `The ${ this.currentUser.isStudent ? 'Write' : 'Create' } Tab`,
        image: '/assets/dashboard-tooltips/reading.png',
        body:
          'Readings that you <b>created</b> yourself. Each reading has groups, and each group has a code!',
      },
      {
        title: 'Create A New Group',
        image: '/assets/dashboard-tooltips/groups.png',
        body: 'This creates an exact copy of a reading that you can immediately share with a new group of users.',
      },
      {
        title: 'Copy & Edit',
        image: '/assets/dashboard-tooltips/versioning.png',
        body:
          'This will create a new version of your reading, allowing you to edit it for a new lesson.',
      },
    ]

    this.subscriptions.push(
      this._auth.currentUser.subscribe(user => {
        this.currentUser = user
      }),
      this._copy.activePromotions.subscribe(promo => {
        if (promo.toastMessage && promo.promotionTitle) {
          if (
            !this.currentUser.profileIncomplete &&
            !this.currentUser.hero_status &&
            !this.currentUser.isStudent &&
            this._locker.get(promo.promotionTitle) != true
          ) {
            // Promo toast
            this._messages.sendToast({
              id: 'salepromo',
              message: promo.toastMessage,
              type: 'promo',
              limitToPage: 'dashboard',
              link: '/plans',
              requireDismiss: true,
            })
            // Indicate toast was displayed
            this._locker.set(promo.promotionTitle, true)
          }
        }
      }),
    )
  }

  /**
   * Handle display changes after user details are added
   */
  public userDetailsAdded(): void {
    // Dismiss details modal
    this.showUserDetailsModal = false
  }
}
