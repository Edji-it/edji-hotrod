import { Subscription } from 'rxjs/Rx'
import { Component, OnInit } from '@angular/core'

// Project Dependencies
import { AuthService, ProjectService, SocketService } from '../../shared';

@Component({
  selector: 'hero-tools',
  templateUrl: './hero-tools.component.html',
  styleUrls: ['./hero-tools.component.scss']
})
export class HeroToolsComponent implements OnInit {

  private subscriptions: Subscription[] = []
  private currentProject: any = {}
  private user: any = {}

  // State vars
  private powersLoading: any = {}

  constructor(
    private _projects: ProjectService,
    private _auth: AuthService,
    private _socket: SocketService
  ) {
    
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
}