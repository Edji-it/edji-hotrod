import { Subscription } from 'rxjs/Rx'
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

// Project Dependencies
import { AuthService, ProjectService, ReadingService, SocketService } from '../../shared';
import { CommentStats, Project, Reading } from './../../shared/datatypes';

@Component({
  selector: 'owner-tools',
  templateUrl: './owner-tools.component.html',
  styleUrls: ['./owner-tools.component.scss']
})
export class OwnerToolsComponent implements OnInit {
  @Output() hide: EventEmitter<any> = new EventEmitter()

  private subscriptions: Subscription[] = []
  private commentStats: CommentStats
  private currentProject: Project
  private currentReading: Reading
  private user: any = {}
  private showFireFeed: boolean
  private showCommentCounts: boolean
  private showQuestionFeed: boolean

  // State vars
  private powersLoading: any = {}

  constructor(
    private _projects: ProjectService,
    private _auth: AuthService,
    private _socket: SocketService, 
    private _readings: ReadingService
  ) {
    this.commentStats = this._projects.commentStats
  }

  ngOnInit() {
    // Subscribe to the reading
    this.subscriptions.push( this._readings.currentReading.subscribe(
      reading => {
        this.currentReading = reading
      },
      error => {
        console.error(error)
      })
    )
    this.subscriptions.push(
      this._projects.currentProject.subscribe(project => {
        this.currentProject = project
      }, error => {
        console.error(error)
      })
    )
    
    this.subscriptions.push(
        this._auth.getCurrentUser().subscribe((user) => {
            this.user = user
        })
    )
  }

  private togglePower(powerName: string, turnOn: boolean) {
    // set heat vision to loading
      this.powersLoading.heatVision = true
      setTimeout(() => {
        // stop heat vision loading
        this.powersLoading.heatVision = false
      }, 1000)

      // Toggle the Heat Vision boolean
      let updateObj: any = {}
      updateObj[powerName] = turnOn

      this._projects.update(updateObj, this.currentProject._id)
        .take(1)
        .subscribe((project) => {
          // Live update users once save is successful
          this._socket.toggleHeatVision({ all: turnOn })
        })
  }

  private showElseFalse(displayPane: string) {
    switch(displayPane) {
      case 'showQuestionFeed':
        this.showQuestionFeed = !this.showQuestionFeed
        this.showFireFeed = false
        this.showCommentCounts = false
        break
      case 'showFireFeed':
        this.showQuestionFeed = false
        this.showFireFeed = !this.showFireFeed
        this.showCommentCounts = false
        break
      case 'showCommentCounts':
        this.showQuestionFeed = false
        this.showFireFeed = false
        this.showCommentCounts = !this.showCommentCounts
        break
      default:
        this.showCommentCounts = false
        this.showFireFeed = false
        this.showQuestionFeed = false
    }
  }

  // private hackyGetCommentStats(): string[] {
  //   return Object.keys(this.commentStats.stats.userRef)
  // }

}