import { Observable, Subscription } from 'rxjs/Rx';
import { ActivatedRoute, Params } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { ProjectService } from '../shared/project.service';

@Component({
    // moduleId: module.id,
    selector: 'edji-project-page',
    styleUrls: ['project-page.component.scss'],
    templateUrl: 'project-page.component.html',
    providers: [
    ]
})
export class ProjectPageComponent implements OnInit, OnDestroy {
    private projectId: any;
    private project: any = {};
    private subscriptions: Subscription[] = [];
    private error: string;

    constructor(private _route: ActivatedRoute, private _projects: ProjectService) {
        
    }

    ngOnInit() {
        // gets id from route to compare to currentProject from projects.service
        let expectedId: string = this._route.snapshot.params['id'];

        this.subscriptions.push(
            this._projects.currentProject.subscribe(
                (project) => {
                    // if the current project in projects.service isn't the same as the one requested by the route:
                    //  update currentProject in projects.service
                    if (project._id != expectedId) {
                        this._projects.setCurrentProject(expectedId)
                            .subscribe((data) => {
                                console.log("setCurrentProject finished");
                            })
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