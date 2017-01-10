import { Router } from '@angular/router';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { AuthService } from '../auth.service';
import { ProjectService } from '../project.service';

@Component({
  selector: 'side-bar',
  styleUrls: [ './side-bar.component.scss' ],
  templateUrl: './side-bar.component.html'
})
export class SideBarComponent implements OnInit, OnDestroy {
    @Input() hasCommentCount: boolean;
    
    private user: any;
    private commentStats: any = {};
    private subscriptions: Subscription[] = [];
    private showCommentCounts: boolean = false;

    constructor(private _auth: AuthService, private _router: Router, private _project: ProjectService) {

    }
    
    ngOnInit() {
      this.user = this._auth.getUser();

      if (this.hasCommentCount) {
        this.subscriptions.push(
          this._project.currentCommentStats.subscribe(data => {
            console.log(data);
            // this.commentStats.users = [];
            this.commentStats = data;
          }, error => {
            console.log(error);
          })
        );
        
      }
    }

    ngOnDestroy() {
      this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
    }

    toggleCommentCounts() {

    } 

    logout() {
        this._auth.logout();
        this._router.navigate(['/home']);
    }
}
