import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, ReadingService, SocketService } from '../../_services'
import { CommentStats, Project, Reading } from './../../shared/datatypes'
import { ActivatedRoute } from '@angular/router'
import { ProjectStore } from 'src/app/_store'

@Component({
  selector: 'owner-tools',
  templateUrl: './owner-tools.component.pug',
  styleUrls: ['./owner-tools.component.scss'],
})
export class OwnerToolsComponent implements OnInit {
  @Output() hide: EventEmitter<any> = new EventEmitter()

  private subscriptions: Subscription[] = []

  public commentStats: CommentStats
  public currentProject: Project
  public currentReading: Reading
  public user: any = {}
  /**
   * @todo clean up boolean trap
   */
  public showAllComments: boolean = false
  public showCommentCounts: boolean = false
  public showQuestionFeed: boolean = false
  public showReadingRecap: boolean = false
  public showCoOwnerGuide: boolean = false

  public ownerToolBlockHeight: string

  // State vars
  public powersLoading: any = {}

  constructor(
    private projectStore: ProjectStore,
    private _auth: AuthService,
    private _socket: SocketService,
    private _readings: ReadingService,
    private angulartics: Angulartics2,
    private _route: ActivatedRoute,
  ) {
    this.commentStats = this.projectStore.commentStats
  }

  ngOnInit() {
    // Subscribe to the reading
    this.subscriptions.push(
      this._readings.currentReading.subscribe(
        reading => {
          this.currentReading = reading
          if (this.currentReading.questions && this.currentReading.questions.length > 0) {
            this.ownerToolBlockHeight = '285px'
          } else {
            this.ownerToolBlockHeight = '221px'
          }
        },
        error => {
          console.error(error)
        },
      ),
      this.projectStore.currentProject.subscribe(
        project => {
          // For transitioning how the server handles teacher/owner ids
          if (!project.owner_id || typeof project.owner_id != 'string') {
            if (typeof project.teacher_id == 'string') {
              project.owner_id = project.teacher_id
            } else if (project.teacher_id) {
              project.owner_id = project.teacher_id._id
            }
          }
          this.currentProject = project
        },
        error => {
          console.error(error)
        },
      ),
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
      }),
      // Watch URL params for quick links
      this._route.queryParams.subscribe(params => {
        if (params.studentList) {
          this.showCommentCounts = true
          if (params.studentList === 'coteach') {
            this.showCoOwnerGuide = true
          }
        }
      }),
    )
  }

  private togglePower(powerName: string, turnOn: boolean) {
    // fire an analytic event here for tracking purposes
    let toggle = 'Off'
    if (turnOn) {
      toggle = 'On'
    }
    this.angulartics.eventTrack.next({
      action: 'teacherTools_heatVision_toggle' + toggle,
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })

    // set heat vision to loading
    this.powersLoading.heatVision = true
    setTimeout(() => {
      // stop heat vision loading
      this.powersLoading.heatVision = false
    }, 1000)

    // Toggle the Heat Vision boolean
    let updateObj: any = {}
    updateObj[powerName] = turnOn

    this.projectStore
      .update(updateObj, this.currentProject._id)
      .pipe(take(1))
      .subscribe(project => {
        // Live update users once save is successful
        this._socket.toggleHeatVision({ all: turnOn })
      })
  }

  private showElseFalse(displayPane: string) {
    switch (displayPane) {
      case 'showQuestionFeed':
        this.showQuestionFeed = !this.showQuestionFeed
        this.showAllComments = false
        this.showCommentCounts = false
        this.showReadingRecap = false
        // fire an analytic event here for tracking purposes
        this.angulartics.eventTrack.next({
          action: 'teacherTools_questionPanel_open',
          properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
        })
        break
      case 'showAllComments':
        this.showQuestionFeed = false
        this.showAllComments = !this.showAllComments
        this.showCommentCounts = false
        this.showReadingRecap = false
        // fire an analytic event here for tracking purposes
        this.angulartics.eventTrack.next({
          action: 'teacherTools_firefeed_open',
          properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
        })
        break
      case 'showCommentCounts':
        this.showQuestionFeed = false
        this.showAllComments = false
        this.showCommentCounts = !this.showCommentCounts
        this.showReadingRecap = false
        // fire an analytic event here for tracking purposes
        this.angulartics.eventTrack.next({
          action: 'teacherTools_leaderboard_open',
          properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
        })
        break
      case 'showReadingRecap':
        this.showQuestionFeed = false
        this.showAllComments = false
        this.showCommentCounts = false
        this.showReadingRecap = !this.showReadingRecap
        break
      default:
        this.showCommentCounts = false
        this.showAllComments = false
        this.showQuestionFeed = false
        this.showReadingRecap = false
    }
  }

  // private hackyGetCommentStats(): string[] {
  //   return Object.keys(this.commentStats.stats.userRef)
  // }
}
