import { Subscription } from 'rxjs/Rx'
import { Component, OnInit } from '@angular/core'

// Project Dependencies
import { AuthService, ProjectService } from '../../shared';

@Component({
  selector: 'owner-tools',
  templateUrl: './owner-tools.component.html',
  styleUrls: ['./owner-tools.component.scss']
})
export class OwnerToolsComponent implements OnInit {

  private subscriptions: Subscription[] = []
  private commentStats: any = {}
  private currentProject: any = {}
  private user: any = {}

  // State vars
  private powersLoading: any = {}

  constructor(
    private _projects: ProjectService,
    private _auth: AuthService
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this._projects.currentCommentStats.subscribe(data => {
        // this.commentStats.users = []
        this.commentStats = data
      }, error => {
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

}