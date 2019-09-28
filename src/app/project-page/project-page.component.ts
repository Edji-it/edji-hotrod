import { Title } from '@angular/platform-browser'
import { Subscription } from 'rxjs'
import { Router, ActivatedRoute } from '@angular/router'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

// Internal
import { AuthService, ReadingService, SocketService, AudioService, AcademyService } from '../_services'
import { Project, Reading, User } from './../shared/datatypes'
import { ProjectStore } from '../_store'

@Component({
  // moduleId: module.id,
  selector: 'edji-project-page',
  styleUrls: ['project-page.component.scss'],
  templateUrl: './project-page.component.pug',
  providers: [
    // Provided for child audio comments
    AudioService,
  ],
})
export class ProjectPageComponent implements OnInit, OnDestroy {
  /*
        Project Page
        Last Mod: 29 July 2017 - Nick Pumper

        The bones for where a project will sit inside of.
    */

  public project: Project = <Project>{}
  public reading: any = {}
  private subscriptions: Subscription[] = []
  private joinedRoom: boolean = false
  public error: string
  private user: User
  // private liveCount: number = 1
  private createdDate: Date
  private createDate: string
  public showLoginModal: boolean = false
  public showArchiveModal: boolean = false

  constructor(
    private _academy: AcademyService,
    private _router: Router,
    private projectStore: ProjectStore,
    private _socket: SocketService,
    private _auth: AuthService,
    private route: ActivatedRoute,
    private _readings: ReadingService,
    private _title: Title,
    private angulartics: Angulartics2,
  ) {}

  ngOnInit() {
    // this makes the window always render scrolled to the top
    this._router.events.subscribe(() => {
      window.scrollTo(0, 0)
    })

    // gets id from route
    let idParam: string = this.route.snapshot.params['id']

    /** Set the current user every time it changes */
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
        if (!this.user.isLoggedIn) {
          this.showLoginModal = true
        }
        // Join socket + start reading timer
        if (this.user._id && this.project._id && !this.joinedRoom) {
          this.joinRoom(this.user, this.project)
        }
      }),
    )

    // Set current project AND subscribe to updates from that project
    this.projectStore.setCurrentProject(idParam).subscribe(
      project => {
        if (project) {
          // If the reading is archived, we'll show them a banner or modal
          if (project.archived) {
            // If not owner or existing student, block viewing and show modal
            let notExistingStudent = project.students_ids && project.students_ids.indexOf(this.user._id) < 0
            let notTeacher = this.user._id !== project.teacher_id
            if (notExistingStudent && notTeacher) {
              // we don't want the login modal to get in the way
              this.showLoginModal = false
              this.showArchiveModal = true
            }
          }

          this.project = project
          // Join socket + start reading timer
          if (this.user._id && this.project._id && !this.joinedRoom) {
            this.joinRoom(this.user, this.project)
            this.projectStore.addUserToProject(this.project._id)
          }

          if (this.project.reading_id && this.project.reading_id['_id']) {
            this.reading = this.project.reading_id
            this._readings.setReadingObj(this.project.reading_id)

            this._title.setTitle('Edji | ' + this.reading.title)

            let analyticsType = 'joined'
            if (this.user._id === this.project.teacher_id) {
              analyticsType = 'created'
            }
            // fire an analytic event here for tracking purposes
            this.angulartics.eventTrack.next({
              action: analyticsType + 'Reading_open',
              properties: {
                category: this._auth.setAnalyticEventCategory(),
                label: this._auth.setAnalyticEventLabel(),
              },
            })
          }
        }
      },
      error => {
        // TRACK EXCEPTION
        if (error.status == 404) {
          // this means that we didn't get the project, so we'll direct them to the 404 page
          this._router.navigate(['/not-found'])
        }
      },
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
    // End socket connections
    this._socket.leaveRoom()
    this._academy.stopReadingTimer()
  }

  /**
   * Join Socket room and start reading ticks
   * @param user Current user on reading
   * @param project Group user is joining
   */
  private joinRoom(user, project): void {
    this.joinedRoom = true
    // Join Socket Room based on ID param
    this._socket.joinSocketRoom(project._id, user._id)
    // Start Reading Timer
    this._academy.startReadingTimer(user, project)
    // this will set the user's status on the leaderboard
    this.projectStore.commentStats.userStatus(this.user, 'active')
    if (this.user._id !== this.project.teacher_id) {
      // emit the socket back to the teacher
      this._socket.groupUpdateEvent({
        type: 'updateUserStatus',
        status: 'active',
        user: this.user,
      })
    }
  }
}
