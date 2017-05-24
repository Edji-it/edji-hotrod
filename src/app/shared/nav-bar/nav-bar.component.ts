import { Router } from '@angular/router'
import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs/Rx'
// import { EventEmitter } from '@angular/forms/src/facade/async'

import { Project, Reading } from '../datatypes'
import { AuthService } from '../auth.service'
import { ProjectService, SocketService, PowerToggle, ReadingService } from '..'

@Component({
  selector: 'nav-bar',
  styleUrls: [ './nav-bar.component.scss' ],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit, OnDestroy {
    @Input() canPublish: boolean
    @Input() pageTitle: string
    @Input() showProjectInfo: boolean
    
    @Output() saveAction: EventEmitter<any> = new EventEmitter()
    @Output() shareAction: EventEmitter<any> = new EventEmitter()

    private user: any
    private currentProject: any
    private createdDate: string
    private liveCount: number = 1
    private currentReading: any
    private subscriptions: Subscription[] = []
    private liveCountSubscription: Subscription
    private showCommentCounts: boolean = false
    private mNavShow: boolean = false
    private isMobile: boolean = false
    private powersLoading: {
      heatVision?: boolean
    } = { }
    private tooltipPlacement: string = 'right'
    
    // Group/Share form
    private submitted: boolean = false
    private groupLabel: string = "Group 1"
    private shareLoading: boolean = false

    constructor(
          private _auth: AuthService, 
          private _socket: SocketService, 
          private _router: Router, 
          private _projects: ProjectService,
          private _readings: ReadingService
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
                    this.currentProject = project;
                    this.createdDate = new Date(project.createdAt).toDateString()
                },
                error => {
                    console.error(error);
                }
            )
        )

        // Subscribe to user count updates       
        this.subscriptions.push(
          this._socket.liveUsersCount().subscribe((users) => {
                  this.liveCount = users.length
              }, (error) => {
                  console.warn(error)
              })
        )
      }

    }

    ngOnDestroy() {
      this.subscriptions.forEach((sub) => { sub.unsubscribe() })
    }

    toggleCommentCounts() {
    }

    private togglePower(powerName: string, value: boolean) {
      // set heat vision to loading
      this.powersLoading.heatVision = true
      setTimeout(() => {
        // stop heat vision loading
        this.powersLoading.heatVision = false
      }, 1000)

      // Toggle the Heat Vision boolean
      let updateObj: any = {}
      updateObj[powerName] = value

      this._projects.update(updateObj, this.currentProject._id)
        .take(1)
        .subscribe((project) => {
          // Live update users once save is successful
          this._socket.toggleHeatVision({ all: value })
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

    finalizeReadingAndShare(groupLabel: string) {
      this.submitted = true
      this.shareLoading = true
      if (groupLabel.length < 1) {
        this.shareLoading = false
        return
      }
      this.shareAction.emit(groupLabel)
    }
}
