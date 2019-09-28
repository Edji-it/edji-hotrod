import { Angulartics2 } from 'angulartics2'
import { ActivatedRoute, Router } from '@angular/router'
import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'

// Project Dependencies
import {
  AuthService,
  SocketService,
  ReadingService,
  SecretSwitchesService,
  UtilToolService,
  Secrets,
  AcademyState,
  Academy,
  MessageToast,
} from '../../_services'
import { User, Project } from '../datatypes'
import { AutosaveState } from '../../new-reading-page'
import { ProjectStore } from 'src/app/_store'

@Component({
  selector: 'nav-bar',
  styleUrls: ['./nav-bar.component.scss'],
  templateUrl: './nav-bar.component.pug',
})
export class NavBarComponent implements OnInit, OnDestroy {
  @Input() pageTitle: string
  // Static input to display Save/Share buttons
  @Input() canPublish: boolean
  @Input() showProjectInfo: boolean
  @Input() showDashboardOptions: boolean
  @Input() hideAccountOptions: boolean
  @Input() saveState: AutosaveState

  @Output() saveAction: EventEmitter<any> = new EventEmitter()
  @Output() shareAction: EventEmitter<ReadingShareObject> = new EventEmitter<ReadingShareObject>()
  @Output() previewAction: EventEmitter<any> = new EventEmitter()

  public showAvatarDropdown: boolean = false
  public showAcademyDropdown: boolean = false
  public showShareTooltip: boolean = false
  public user: any
  public academyState: AcademyState = {}
  public currentAcademy: Academy = {}
  public currentProject: Project
  public createdDate: string
  public liveCount: number = 1
  public currentReading: any
  public subscriptions: Subscription[] = []
  public liveCountSubscription: Subscription
  public showCommentCounts: boolean = false
  public showReferralModal: boolean = false
  // Share Code modal properties
  public showShareCodeModal: boolean = false
  public isNewReading: boolean = false
  // Toggle mobile navigation display
  public mNavShow: boolean = false
  // "Butter Bar" alerts for group code entry
  public messages: {
    invalidCode?: boolean
    serviceError?: boolean
    groupNameLengthError?: boolean
  } = {}

  // Group/Share form
  public submitted: boolean = false
  public groupLabel: string = 'Group 1'
  public customCode: string = ''
  public shareLoading: boolean = false

  public projectCode: string
  public joinLoading: boolean = false
  public errorObject: {
    invalidCode?: string
    loginFailed?: string
    serverError?: string
  } = {}
  public window
  public showHeroSubModal: boolean
  public couponCode: string

  // Nav menu variables
  public academyMenuShow: boolean = false
  public isTeacher: boolean = false
  public isAcademyAdmin: boolean = false
  public secretSwitches: Secrets = {}
  public currentPage: string = ''
  public navLinks: NavLink[] = []

  // Dev only display
  public isDevDeployed: boolean

  // Copy Variables
  public heroBtnCopy: string = 'Upgrade to Hero'

  // Nav Slider Button expansion booleans
  public sliderBtnExpanded: {
    heat?: boolean
    group?: boolean
    code?: boolean
    academy?: boolean
  } = {
    // Default expand code
    code: true,
  }
  // Nav Slider Button loading states
  public sliderBtnLoading: {
    heat?: boolean
  } = {}

  public toasts: MessageToast[] = []

  constructor(
    public _route: ActivatedRoute,
    public _auth: AuthService,
    private _socket: SocketService,
    public _router: Router,
    private angulartics: Angulartics2,
    private projectStore: ProjectStore,
    private _readings: ReadingService,
    public _util: UtilToolService,
    private _secret: SecretSwitchesService,
  ) {
    if (window.location.host.indexOf('dev.edji.it') > -1) {
      this.isDevDeployed = true
    }
  }

  ngOnInit() {
    /** Set the current user every time it changes */
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
        this.navLinks = this.generateNavLinks(user)
      }),
      this._auth.currentAcademyState.subscribe(currentState => {
        this.academyState = currentState
        // Set abbreviation
        if (this.academyState && this.academyState.academies) {
          this.currentAcademy = this.academyState.academies[this.academyState.selected]
        } else {
          this.currentAcademy = {}
        }
      }),
    )

    /**
     * @todo Find a cleaner way to reference the parent page/route
     */
    if (this._router.url.indexOf('/project') > -1) {
      this.currentPage = 'project'
    } else if (this._router.url.indexOf('/home') > -1) {
      this.currentPage = 'home'
    } else if (this._router.url.indexOf('/hero') > -1 || this._router.url.indexOf('/plans') > -1) {
      this.currentPage = 'hero'
    } else if (this._router.url.indexOf('/discover') > -1) {
      this.currentPage = 'discover'
    } else if (this._router.url.indexOf('/dashboard') > -1) {
      this.currentPage = 'dashboard'
    } else {
      this.currentPage = ''
    }

    this.subscriptions.push(
      // Subscribe to current Reading data
      this._readings.currentReading.subscribe(
        reading => {
          this.currentReading = reading
        },
        error => {
          console.error(error)
        },
      ),
      this._route.params.subscribe(params => {
        this.secretSwitches = this._secret.processSwitches(params)
      }),
      this._route.queryParams.subscribe(queryParams => {
        if (queryParams.readingCodeModal) {
          this.showShareCodeModal = true
          this.isNewReading = true
        }
        if (queryParams.showRefer) {
          this.showReferralModal = true
        }
      }),
    )

    if (this.showProjectInfo) {
      this.subscriptions.push(
        // Subscribe to current Project data
        this.projectStore.currentProject.subscribe(
          project => {
            this.currentProject = project
            this.createdDate = new Date(project.createdAt).toDateString()
          },
          error => {
            console.error(error)
          },
        ),
        // Subscribe to user count updates
        this._socket.liveUsersCount.subscribe(
          users => {
            this.liveCount = users.length
          },
          error => {
            console.warn(error)
          },
        ),
      )
    }
    this.window = window
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  logout() {
    this._auth.logout()
    this._router.navigate(['/home'])
  }

  mNavShowFlip() {
    if (this.mNavShow === false) {
      this.mNavShow = true
    } else {
      this.mNavShow = false
    }
  }

  /**
   * Determine nav links for user
   * @param identities current users identities
   * @returns NavLinks array
   */
  generateNavLinks(user: User): NavLink[] {
    let links: NavLink[] = []
    if (user.isStudent) {
      // Student Nav Links
      // 1st: Read dashboard link
      links.push({
        id: 'navRead',
        route: '/dashboard/read',
        displayName: 'Read',
        tooltip: 'Read with your class',
      })
      // 2nd Create dashboard link
      links.push({
        id: 'navCreate',
        route: '/dashboard/create',
        displayName: 'Write',
        tooltip: 'Share your writing',
      })
    } else {
      // Teacher Nav Links
      // Create dashboard link
      links.push({
        id: 'navCreate',
        route: '/dashboard/create',
        displayName: 'Create',
        tooltip: 'Create readings to share',
      })
      // Read dashboard link
      links.push({
        id: 'navRead',
        route: '/dashboard/read',
        displayName: 'Read',
        tooltip: 'Join readings from others',
      })
      // Discover Feed Link
      links.push({
        id: 'navDiscover',
        route: '/discover',
        displayName: 'Discover',
        tooltip: 'Discover Readings from other Teachers',
      })
    }
    return links
  }

  // finalizeReadingAndShare(shareObj: ReadingShareObject) {
  //   this.messages = {}
  //   this.submitted = true
  //   this.shareLoading = true
  //   if (shareObj.groupLabel.length < 1) {
  //     this.shareLoading = false
  //     this.messages.groupNameLengthError = true
  //     return // we should give the user some sort of feedback here
  //   }

  //   // we only want to check the validate route if there is a custom code - otherwise let it go through
  //   if (shareObj.customCode) {
  //     // does the project exist? this call will actually fail if it does
  //     this.projectStore.validateProjectCode(shareObj.customCode)
  //     .pipe(take(1))
  //     .subscribe((res) => {
  //       // this is actually an error in this case! lol. If the code IS valid, we want them NOT to try and make a reading
  //       this.shareLoading = false
  //       this.messages.invalidCode = true
  //     }, (err) => {
  //       this.shareLoading = false

  //       // this is actually the successful response :)
  //       if (err.status == 404) {
  //         this.shareAction.emit(shareObj)
  //       } else {
  //         this.messages.serviceError = true
  //       }
  //     })
  //   } else {
  //     this.shareAction.emit(shareObj)
  //     // Nav bar does not manage validation on New Reading, so we make sure the button doesn't get stuck loading
  //     // Note: The above condition will clear shareLoading in both cases
  //     setTimeout(() => {
  //       this.shareLoading = false
  //     }, 500)
  //   }
  // }

  /**
   * Validates project and then navigates to project if valid
   * @param code The project's short code
   */
  private joinSession(code: string): void {
    // console.log("first call", code);
    this.joinLoading = true
    this.projectStore.join(code).subscribe(
      data => {
        console.log('data', data)
        this.joinLoading = false
        if (data._id) {
          this._router.navigate(['/project', data._id])
        } else {
          this.errorObject.invalidCode = "We don't think that's a real code :confused:"
          console.log(this.errorObject)
        }
      },
      error => {
        this.joinLoading = false
        console.error(error)
        this.errorObject.invalidCode = "Oh no! Something went wrong and we don't know what happened!"
      },
    )
  }

  /**
   * Clears all errorObject strings to equal empty strings
   */
  private clearErrors(): void {
    for (let property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = ''
      }
    }
  }

  /**
   * Open Edji Guide
   */
  private openGuides(): void {
    this.showAvatarDropdown = false
    // Open Guides in new tab
    window.open('http://guide.edji.it', '_blank')
  }

  /**
   * Open Account page
   */
  private openAccount(): void {
    this.showAvatarDropdown = false
    this._router.navigate(['/account'])
  }

  /**
   * Open Feedback Modal
   * - Requires "edji-feedback" component to exist on route
   */
  private openFeedback(): void {
    this.showAvatarDropdown = false
    this._util.showFeedbackModal = true
  }

  /**
   * Open Referral Modal
   */
  private openReferralModal(): void {
    this.showAvatarDropdown = false
    // Open the modal
    this.showReferralModal = true
  }

  /**
   * When the user decides to exercise their coupon code
   */
  public useCoupon(couponCode: string) {
    // Hide the referral modal
    this.showReferralModal = false
    // Set the coupon code passed through from the referral modal
    this.couponCode = couponCode
    // Show the hero subscription modal and pass the coupon code in
    this.showHeroSubModal = true
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action: 'referral_redeemCoupon' + this.getCouponNum(this.couponCode),
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }

  // we don't want to expose the coupon code to analytics, so we'll reference the number of referrals
  private getCouponNum(couponCode: string): number {
    switch (couponCode) {
      case 'HOTROD_HERO_ONE5TH':
        return 1
      case 'HOTROD_HERO_24BUCKS':
        return 2
      case 'HOTROD_HERO_36BIGONES':
        return 3
      case 'HOTROD_HERO_4FIFTHS':
        return 4
      case 'HOTROD_HERO_REFERMASTER':
        return 5
      default:
        return 0
    }
  }

  /**
   * Toggle slider btn by key
   * @param key String key for slider btn
   */
  toggleSlider(key: string): void {
    // Track usage
    this.angulartics.eventTrack.next({
      action: 'navBar_sliderToggle_' + key,
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })

    this.sliderBtnExpanded[key] = !this.sliderBtnExpanded[key]
  }

  /**
   * Toggle Heat Vision
   */
  public toggleHeatVision(toggleTo: boolean): void {
    // Do not attempt if user does not own project
    if (!this.currentProject.isTeaching) {
      return
    }

    this.angulartics.eventTrack.next({
      action: 'navBar_heatVision_toggle' + toggleTo,
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })

    // set heat vision to loading
    this.sliderBtnLoading.heat = true

    this.projectStore
      .update({ heat_vision: toggleTo }, this.currentProject._id)
      .pipe(take(1))
      .subscribe(project => {
        // Live update users once save is successful
        this._socket.toggleHeatVision({ all: toggleTo })
        // Allow a moment for changes to propagate to users
        setTimeout(() => {
          // stop heat vision loading
          this.sliderBtnLoading.heat = false
        }, 500)
      })
  }
}

export interface ReadingShareObject {
  groupLabel: string
  customCode?: string
}

export interface NavLink {
  id: string
  route: string
  displayName: string
  tooltip: string
}
