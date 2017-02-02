import { Router } from '@angular/router';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { AuthService } from '../auth.service';
import { ProjectService, SocketService, PowerToggle } from '..';

@Component({
  selector: 'side-bar',
  styleUrls: [ './side-bar.component.scss' ],
  templateUrl: './side-bar.component.html'
})
export class SideBarComponent implements OnInit, OnDestroy {
    @Input() hasCommentCount: boolean;
    
    private user: any;
    private currentProject: any;
    private commentStats: any = {};
    private subscriptions: Subscription[] = [];
    private showCommentCounts: boolean = false;
    private mNavShow: boolean = false;
    private isMobile: boolean = false;

    constructor(private _auth: AuthService, private _socket: SocketService, private _router: Router, private _projects: ProjectService) {

    }
    
    ngOnInit() {
      /** Set the current user every time it changes */
      this.subscriptions.push(
          this._auth.getCurrentUser().subscribe((user) => {
              this.user = user;
          })
      );

      if (this.hasCommentCount) {
        this.subscriptions.push(
          this._projects.currentCommentStats.subscribe(data => {
            // this.commentStats.users = [];
            this.commentStats = data;
          }, error => {
            console.error(error);
          })
        );

        this._projects.currentProject.subscribe(project => {
          console.log("got updated project");
          this.currentProject = project;
        }, error => {
          console.error(error)
        });
        
      }

      if (window.screen.availWidth < 768) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }

    }

    ngOnDestroy() {
      this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
    }

    toggleCommentCounts() {
    }

    private toggleHeatVision() {
      // Create a copy of the project to post
      let updatedProject = Object.assign({}, this.currentProject);
      // Toggle the Heat Vision boolean
      updatedProject.heat_vision = !updatedProject.heat_vision;

      this._projects.create(this.currentProject.reading_id, updatedProject)
        .take(1)
        .subscribe((project) => {
          // Live update users once save is successful
          this._socket.toggleHeatVision({ all: project.heat_vision }, project._id);
        });
    }

    logout() {
        this._auth.logout();
        this._router.navigate(['/home']);
    }

    mNavShowFlip() {
      if (this.mNavShow === false) {
        this.mNavShow = true;
      } else {
        this.mNavShow = false;
      }
    }
}
