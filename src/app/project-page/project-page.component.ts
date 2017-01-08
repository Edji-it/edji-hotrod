import { Observable, Subscription } from 'rxjs/Rx';
import { ActivatedRoute, Params } from '@angular/router';
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
    private project: any = {};
    private subscriptions: Subscription[] = [];
    private error: string;
    private user: any;
    private liveCount: number = 1;

    constructor(
        private _route: ActivatedRoute, 
        private _projects: ProjectService,
        private _socket: SocketService,
        private _auth: AuthService) {
        
        this.user = _auth.getUser();
    }

    ngOnInit() {
        // gets id from route to compare to currentProject from projects.service
        let expectedId: string = this._route.snapshot.params['id'];

        // Join and update live user count
        this.subscriptions.push(
            this._socket.joinLiveCount(expectedId, this.user._id).subscribe((count) => {
                this.liveCount = count;
            }, (error) => {
                console.warn(error);
            })
        );

        // subscribe to the currentProject value
        this.subscriptions.push(
            this._projects.currentProject.subscribe(
                (project) => {
                    // if the current project in projects.service isn't the same as the one requested by the route:
                    //  update currentProject in projects.service
                    if (project._id !== expectedId) {
                        // I don't actually care to subscribe, but it doesn't fire if I don't...
                        this._projects.setCurrentProject(expectedId).take(1).subscribe();
                    } else {
                        this.project = project;
                    }
                }
            )
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
    }
}