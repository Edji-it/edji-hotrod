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
        this.projectId = this._route.snapshot.params['id'];
        // this.project = this._projects.currentProject.last;
        // console.log(this.project);
        this.subscriptions.push(
            this._projects.currentProject.subscribe(
                (project) => {
                    this.project = project;
                }
            )
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
    }
}