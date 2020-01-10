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

  public ownerToolShow: boolean
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
}
