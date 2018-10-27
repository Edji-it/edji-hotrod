import { Angulartics2 } from 'angulartics2';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService, ProjectService, SocketService, PowerToggle, ReadingService, SecretSwitchesService, UtilToolService, Secrets, AcademyState, Academy } from '../../_services'

@Component({
  selector: 'nav-bar',
  styleUrls: [ './nav-bar.component.scss' ],
  templateUrl: './nav-bar.component.pug',
})
export class NavBarComponent implements OnInit, OnDestroy {
    @Input() pageTitle: string
    // Static input to display Save/Share buttons
    @Input() canPublish: boolean
    @Input() showProjectInfo: boolean
    @Input() showDashboardOptions: boolean
    @Input() hideAccountOptions: boolean
    
    @Output() saveAction: EventEmitter<any> = new EventEmitter()
    @Output() shareAction: EventEmitter<ReadingShareObject> = new EventEmitter<ReadingShareObject>()


    public showAvatarDropdown: boolean = false
    public showAcademyDropdown: boolean = false
    public showShareTooltip: boolean = false
    public user: any
    public academyState: AcademyState = {}
    public currentAcademy: Academy = {}
    public currentProject: any
    public projectOwner: any
    public createdDate: string
    public liveCount: number = 1
    public currentReading: any
    public subscriptions: Subscription[] = []
    public liveCountSubscription: Subscription
    public showCommentCounts: boolean = false
    public showReferralModal: boolean = false
    public mNavShow: boolean = false
    public isMobile: boolean = false
    public powersLoading: {
      heatVision?: boolean
    } = { }
    public tooltipPlacement: string = 'right'
    public messages: {
      invalidCode?: boolean,
      serviceError?: boolean,
      groupNameLengthError?: boolean
    } = { }
    
    // Group/Share form
    public submitted: boolean = false
    public groupLabel: string = "Group 1"
    public customCode: string = ""
    public shareLoading: boolean = false

    public projectCode: string
    public joinLoading: boolean = false
    public errorObject: {
      "invalidCode"?: string,
      "loginFailed"?: string,
      "serverError"?: string
    } = {}
    public window
    public showHeroSubModal: boolean
    public couponCode: string

    // Nav menu variables
    public academyMenuShow: boolean = false
    public isTeacher: boolean = false
    public isAcademyAdmin: boolean = false
    public secretSwitches: Secrets = {}
    public currentPage: string = ""

    // Copy Variables
    public heroBtnCopy: string = "Upgrade to Hero"

    constructor(
          public _route: ActivatedRoute,
          public  _auth: AuthService, 
          private _socket: SocketService, 
          public _router: Router,
          private angulartics: Angulartics2,
          private _projects: ProjectService,
          private _readings: ReadingService,
          public _util: UtilToolService,
          private _secret: SecretSwitchesService
        ) {

    }
    
    ngOnInit() {
      /** Set the current user every time it changes */
      this.subscriptions.push(
          this._auth.getCurrentUser().subscribe((user) => {
              this.user = user
              this.isTeacher = this.user.identities && this.user.identities.indexOf('teacher') > -1
          }),
          this._auth.currentAcademyState.subscribe((currentState) => {
            this.academyState =  currentState
            // Set abbreviation
            this.currentAcademy = this.academyState && this.academyState.academies[this.academyState.selected] || {}
          })
      )

      if (window.screen.availWidth < 768) {
        this.isMobile = true
        this.tooltipPlacement = 'bottom'
      } else {
        this.isMobile = false
      }

      if (this._router.url.indexOf('/project') > -1) {
        this.currentPage = "project"
      } else if (this._router.url.indexOf('/home') > -1) {
        this.currentPage = "home"
      } else if (this._router.url.indexOf('/hero') > -1) {
        this.currentPage = "hero"
      }

      this.subscriptions.push(
        // Subscribe to current Reading data 
        this._readings.currentReading.subscribe(
            reading => {
                this.currentReading = reading;
            },
            error => {
                console.error(error);
            }
        ),
        this._route.params.subscribe((params) => {
          this.secretSwitches = this._secret.processSwitches(params)
        })
      )
      
      if (this.showProjectInfo) {
        this.subscriptions.push(
          // Subscribe to current Project data
          this._projects.currentProject.subscribe(
                project => {
                    this.currentProject = project
                    this.projectOwner = project.teacher
                    this.createdDate = new Date(project.createdAt).toDateString()
                },
                error => {
                    console.error(error);
                }
            ),
             // Subscribe to user count updates   
            this._socket.liveUsersCount.subscribe((users) => {
              this.liveCount = users.length
          }, (error) => {
              console.warn(error)
          })
        )
      }
      this.window = window
    }

    ngOnDestroy() {
      this.subscriptions.forEach((sub) => { sub.unsubscribe() })
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
    //     this._projects.validateProject(shareObj.customCode)
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

    showShareCodeModal() {
      let currentParams = Object.assign({}, this._route.snapshot.queryParams)
      let newParams = Object.assign(currentParams, { readingCodeModal: true })
      this._router.navigate(['.'], { relativeTo: this._route, queryParams: newParams })
    }

    /**
   * Validates project and then navigates to project if valid
   * @param code The project's short code
   */
  private joinSession(code: string): void {
    // console.log("first call", code);
    this.joinLoading = true
    this._projects.validateProject(code)
      .pipe(take(1))
      .subscribe(
        (data) => {
          this.joinLoading = false;
          this.angulartics.eventTrack.next({ action: 'enterLightningCode', properties: { category: 'joinProject', label: 'success' }})
          if (data._id){
            this._router.navigate(['/project', data._id])
          } else {
            this._router.navigate(['/project', code])
          }
        },
        (error) => {
          this.joinLoading = false;
          if (error.status === 500) {
            this.errorObject.invalidCode = "Oh no! Something went wrong and we don't know what happened!"
          } else {
            this.errorObject.invalidCode = "We don't think that's a real code :confused:"
          }
        }
      );
  }

  /**
   * Clears all errorObject strings to equal empty strings
   */
  private clearErrors(): void {
    for (let property in this.errorObject) {
      if (this.errorObject.hasOwnProperty(property) && typeof this.errorObject[property] === 'string') {
        this.errorObject[property] = "";
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
    this._util.showFeedbackModal=true
  }

  /**
   * Open Referral Modal
   */
  private openReferralModal(): void {
    this.showAvatarDropdown = false
    // Open the modal
    this.showReferralModal=true
    // Track when this button is clicked on in angulartics
    this.angulartics.eventTrack.next({ action: 'clickReferralButton', properties: { category: 'referral', label: 'success' }})
  }

  /**
   * When the user decides to exercise their coupon code
   */
  public useCoupon(couponCode: string) {
    // Hide the referral modal
    this.showReferralModal=false
    // Set the coupon code passed through from the referral modal
    this.couponCode = couponCode
    // Show the hero subscription modal and pass the coupon code in
    // setTimeout(() => {
      this.showHeroSubModal = true
    // }, 1000)
  }
}

export interface ReadingShareObject {
  groupLabel: string
  customCode?: string
}