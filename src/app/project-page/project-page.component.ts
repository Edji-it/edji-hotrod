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
        ProjectService
    ]
})
export class ProjectPageComponent implements OnInit, OnDestroy {
    private projectId: any;
    private project: any = {};
    private subscriptions: Subscription[] = [];

    constructor(private _route: ActivatedRoute, private _projects: ProjectService) {
        // this.subscriptions.push(
        //     this._route.params
        //     .subscribe((params: Params) => { 
        //         if(params['id']){
        //             this.projectId = params['id'];
        //             this.getProject(this.projectId);
        //         }
        //     })
        // );
    }

    ngOnInit() {
 
    }

    getProject(projectId) {
        this.subscriptions.push(
            this._projects.get(projectId)
                .subscribe(
                    data => {
                        this.project = data.json();
                    },
                    err => {
                        console.log(err);
                    })
        )
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
    }
}