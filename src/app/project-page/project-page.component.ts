import { Observable, Subscription } from 'rxjs/Rx';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { ProjectService } from '../shared/project.service';
import { SocketService } from '../shared/socket.service';
import { AuthService } from '../shared/auth.service';

@Component({
    // moduleId: module.id,
    selector: 'edji-project-page',
    styleUrls: ['project-page.component.scss'],
    templateUrl: 'project-page.component.html',
    providers: [
        // We want SocketService to be an instance per component
        SocketService
    ]
})
export class ProjectPageComponent implements OnInit, OnDestroy {
    private project: any = {}
    private subscriptions: Subscription[] = []
    private error: string
    private user: any
    private liveCount: number = 1
    private commentCount: number = 0
    private createdDate: Date
    private createDate: string
    private showLoginModal: boolean = false
    
    constructor(
        private _router: Router,
        private _projects: ProjectService,
        private _socket: SocketService,
        private _auth: AuthService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        // this makes the window always render scrolled to the top
        this._router.events.subscribe(() => {
        window.scrollTo(0, 0);
        })
        


        // gets id from route to compare to currentProject from projects.service
        let idParam: string = this.route.snapshot.params['id']

        /** Set the current user every time it changes */
        this.subscriptions.push(
            this._auth.getCurrentUser().subscribe((user) => {
                this.user = user
                if (!this.user.isLoggedIn) { this.showLoginModal = true }
            })
        )

        // Set current project AND subscribe to updates from that project
        this._projects.setCurrentProject(idParam)
            .subscribe(
            (project) => {
                if (project) {
                    this.project = project
                    this.commentCount = project.comments.length
                    this.createdDate = new Date(project.createdAt)
                    this.createDate = this.createdDate.toDateString()

                    // Join and update live user count
                    this.subscriptions.push(
                        this._socket.joinLiveCount(this.project._id, this.user._id).subscribe((users) => {
                            this.liveCount = users.length
                        }, (error) => {
                            console.warn(error)
                        })
                    )

                    this.subscriptions.push(
                        this._projects.currentCommentStats.subscribe(data => {
                            // this.commentStats.users = []
                            this.commentCount = data
                        }, error => {
                            console.error(error)
                        })
                    )
                }
            },
            (error) => {
                // TRACK EXCEPTION
            })

        
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe() })
    }
}