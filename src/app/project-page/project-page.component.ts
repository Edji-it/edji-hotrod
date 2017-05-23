import { Observable, Subscription } from 'rxjs/Rx'
import { Router, ActivatedRoute, Params } from '@angular/router'
import { Component, OnDestroy, OnInit } from '@angular/core'

import { ProjectService, SocketService, AuthService } from '../shared'
import { Project, User } from './../shared/datatypes'

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
    private project: Project = <Project>{}
    private subscriptions: Subscription[] = []
    private error: string
    private user: User
    // private liveCount: number = 1
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

        /** Set the current user every time it changes */
        this.subscriptions.push(
            this._auth.getCurrentUser().subscribe((user) => {
                this.user = user
                if (!this.user.isLoggedIn) { this.showLoginModal = true }
            })
        )

        // gets id from route
        let idParam: string = this.route.snapshot.params['id']

        // Set current project AND subscribe to updates from that project
        this._projects.setCurrentProject(idParam)
            .subscribe(
            (project) => {
                if (project) {
                    this.project = project
                    // this.createdDate = new Date(project.createdAt)
                    // this.createDate = this.createdDate.toDateString()

                }
            },
            (error) => {
                // TRACK EXCEPTION
                if (error.status == 404) {
                    // this means that we didn't get the project, so we'll direct them to the 404 page
                    this._router.navigate(['/not-found'])
                }
            })

        
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe() })
    }
}