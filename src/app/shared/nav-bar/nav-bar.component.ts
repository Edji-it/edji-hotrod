import { Angulartics2 } from 'angulartics2';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs/Rx'
// import { EventEmitter } from '@angular/forms/src/facade/async'

import { Project, Reading } from '../datatypes'
import { AuthService } from '../auth.service'
import { ProjectService, SocketService, PowerToggle, ReadingService, UtilToolService } from '..'

@Component({
  selector: 'nav-bar',
  styleUrls: [ './nav-bar.component.scss' ],
  templateUrl: './nav-bar.component.pug'
})
export class NavBarComponent implements OnInit, OnDestroy {
    @Input() pageTitle: string
    // Static input to display Save/Share buttons
    @Input() canPublish: boolean
    @Input() showProjectInfo: boolean
    @Input() showDashboardOptions: boolean
    
    @Output() saveAction: EventEmitter<any> = new EventEmitter()
    @Output() shareAction: EventEmitter<ReadingShareObject> = new EventEmitter<ReadingShareObject>()


    private showAvatarDropdown: boolean = false
    private showShareTooltip: boolean = false
    private user: any
    private currentProject: any
    private projectOwner: any
    private createdDate: string
    private liveCount: number = 1
    private currentReading: any
    private subscriptions: Subscription[] = []
    private liveCountSubscription: Subscription
    private showCommentCounts: boolean = false
    private showReferralModal: boolean = false
    private mNavShow: boolean = false
    private isMobile: boolean = false
    private powersLoading: {
      heatVision?: boolean
    } = { }
    private tooltipPlacement: string = 'right'
    private messages: {
      invalidCode?: boolean,
      serviceError?: boolean,
      groupNameLengthError?: boolean
    } = { }
    
    // Group/Share form
    private submitted: boolean = false
    private groupLabel: string = "Group 1"
    private customCode: string = ""
    private shareLoading: boolean = false

    private projectCode: string
    private joinLoading: boolean = false
    private errorObject: {
      "invalidCode"?: string,
      "loginFailed"?: string,
      "serverError"?: string
    } = {}
    private projectCodeShow: boolean = true
    private window
    private showHeroSubModal: boolean
    private couponCode: string

    constructor(
          private _route: ActivatedRoute,
          private _auth: AuthService, 
          private _socket: SocketService, 
          private _router: Router,
          private angulartics: Angulartics2,
          private _projects: ProjectService,
          private _readings: ReadingService,
          private _util: UtilToolService
        ) {

    }
    
    ngOnInit() {
      /** Set the current user every time it changes */
      this.subscriptions.push(
          this._auth.getCurrentUser().subscribe((user) => {
              this.user = user
          })
      )

      if (window.screen.availWidth < 768) {
        this.isMobile = true
        this.tooltipPlacement = 'bottom'
      } else {
        this.isMobile = false
      }

      if (this._router.url.indexOf('/project') > -1) {
        this.projectCodeShow = false
      } else {
        this.projectCodeShow = true
      }

      // Subscribe to current Reading data
      this.subscriptions.push(
        this._readings.currentReading.subscribe(
            reading => {
                this.currentReading = reading;
            },
            error => {
                console.error(error);
            }
        )
      )
      
      if (this.showProjectInfo) {
        // Subscribe to current Project data
        this.subscriptions.push(
          this._projects.currentProject.subscribe(
                project => {
                    this.currentProject = project
                    this.projectOwner = project.teacher
                    this.createdDate = new Date(project.createdAt).toDateString()
                },
                error => {
                    console.error(error);
                }
            )
        )

        // Subscribe to user count updates       
        this.subscriptions.push(
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

    finalizeReadingAndShare(shareObj: ReadingShareObject) {
      this.messages = {}
      this.submitted = true
      this.shareLoading = true
      if (shareObj.groupLabel.length < 1) {
        this.shareLoading = false
        this.messages.groupNameLengthError = true
        return // we should give the user some sort of feedback here
      }

      // we only want to check the validate route if there is a custom code - otherwise let it go through
      if (shareObj.customCode) {
        // does the project exist? this call will actually fail if it does
        this._projects.validateProject(shareObj.customCode)
        .take(1)
        .subscribe((res) => {
          // this is actually an error in this case! lol. If the code IS valid, we want them NOT to try and make a reading
          this.shareLoading = false
          this.messages.invalidCode = true
        }, (err) => {
          this.shareLoading = false

          // this is actually the successful response :)
          if (err.status == 404) {
            this.shareAction.emit(shareObj)
          } else {
            this.messages.serviceError = true
          }
        })
      } else {
        this.shareAction.emit(shareObj)
        // Nav bar does not manage validation on New Reading, so we make sure the button doesn't get stuck loading
        // Note: The above condition will clear shareLoading in both cases
        setTimeout(() => {
          this.shareLoading = false
        }, 500)
      }
    }

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
    this.joinLoading = true;
    this.angulartics.eventTrack.next({ action: 'enterLightningCode', properties: { category: 'joinProject', label: 'attempt' }});
    this._projects.validateProject(code)
      .take(1)
      .subscribe(
        (data) => {
          this.joinLoading = false;
          this.angulartics.eventTrack.next({ action: 'enterLightningCode', properties: { category: 'joinProject', label: 'success' }});
          if (data._id){
            this._router.navigate(['/project', data._id]);
          } else {
            this._router.navigate(['/project', code]);
          }
        },
        (error) => {
          this.joinLoading = false;
          if (error.status === 500) {
            this.angulartics.eventTrack.next({ action: 'enterLightningCode', properties: { category: 'joinProject', label: 'failure' }});
            this.errorObject.invalidCode = "Oh no! Something went wrong and we don't know what happened!";
          } else {
            this.errorObject.invalidCode = "We don't think that's a real code :confused:";
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
   * Open Guides in New Tab
   */
  private openGuides(): void {
    window.open('http://guide.edji.it', '_blank')
  }

  /**
   * Open Feedback Modal
   * - Requires "edji-feedback" component to exist on route
   */
  private openFeedback(): void {
    this._util.showFeedbackModal=true
  }

  /**
   * When the user decides to exercise their coupon code
   */
  private useCoupon(couponCode: string) {
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