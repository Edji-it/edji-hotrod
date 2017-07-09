import { Subscription } from 'rxjs/Rx'
import { Component, OnInit } from '@angular/core'

// Project Dependencies
import { AuthService, ProjectService, SocketService } from '../../shared';
import { CommentStats } from './../../shared/datatypes'

@Component({
  selector: 'owner-tools',
  templateUrl: './owner-tools.component.html',
  styleUrls: ['./owner-tools.component.scss']
})
export class OwnerToolsComponent implements OnInit {

  private subscriptions: Subscription[] = []
  private commentStats: CommentStats
  private currentProject: any = {}
  private user: any = {}

  // State vars
  private powersLoading: any = {}

  constructor(
    private _projects: ProjectService,
    private _auth: AuthService,
    private _socket: SocketService
  ) {
    this.commentStats = this._projects.commentStats
  }

  ngOnInit() {

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

  // private hackyGetCommentStats(): string[] {
  //   return Object.keys(this.commentStats.stats.userRef)
  // }

}