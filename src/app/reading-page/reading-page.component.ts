import { AuthService } from '../shared/auth.service';
import { Observable, Subscription } from 'rxjs/Rx';
import { ActivatedRoute, Params } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

import { ReadingService } from '../shared/reading.service';
import { ProjectService } from '../shared/project.service';

@Component({
    // moduleId: module.id,
    selector: 'edji-reading-page',
    styleUrls: ['reading-page.component.scss'],
    templateUrl: 'reading-page.component.html',
    providers: [
        ReadingService,
        ProjectService
    ]
})
export class ReadingPageComponent implements OnInit, OnDestroy {
    private readingId: any = "";
    private reading: any = {};

    private projects: any[] = []; 
    private newProject: any =  {};
    private addNew: boolean = false;

    private subscriptions: Subscription[] = [];
    
    private addingNew: boolean = false;
    private projectErr: any = {};

    constructor(
        private _route: ActivatedRoute,
        private _readings: ReadingService,
        private _projects: ProjectService,
        private _auth: AuthService,
        private angulartics: Angulartics2
    ) {
    }

    ngOnInit() {
        this.subscriptions.push(
            this._route.params
            .subscribe((params: Params) => { 
                if(params['id']){
                    this.readingId = params['id'];
                    this.getReading(this.readingId);
                }
            })
        );
    }

    private getReading(readingId: string) {

        this._readings.get(readingId)
            .take(1)
            .subscribe(
                data => {
                    this.reading = data;
                },
                err => {
                    // TRACK EXCEPTION
                    console.log(err);
                })

        this._projects.getForReading(readingId)
            .take(1)
            .subscribe(
                data => {
                    if (data.json() instanceof Array) {
                        this.projects = data.json();
                    }
                },
                err => {
                    // TRACK EXCEPTION
                    console.log(err);
                }
            )
    }

    private addNewProject(newProject) {
        if (!newProject.label || newProject.label.length < 1) {
            this.projectErr.error = "A project label is required!";
            return;
        }
        this.addingNew = true;

        this.angulartics.eventTrack.next({ action: 'createNewProject', properties: { category: 'contentManagement', label: 'attempt' }});

        // New Projects require a teacher id
        newProject['teacher_id'] = this._auth.getUser()._id;

        this._projects.new(this.readingId, newProject)
            .then(data => {
                this.angulartics.eventTrack.next({ action: 'createNewProject', properties: { category: 'contentManagement', label: 'success' }});
                this.addingNew = false;
                // Set isNew flag to show user the newly added project
                data['isNew'] = true;
                // Add to current project list
                this.projects.unshift(data);
                // Reset New Project 
                this.addNew = false;
                this.newProject = {};
            }, error => {
                this.addingNew = false;
                console.log(error);
            });

    }

    /**
     * Removes deleted Project from local array after confirmed by modal
     */
    private removeProject(project) {
        this.angulartics.eventTrack.next({ action: 'deleteProject', properties: { category: 'contentManagement', label: 'attempt' }});

        if (project._id) {
            for (var i = 0; i < this.projects.length; i++) {
                if (this.projects[i]._id && this.projects[i]._id === project._id) {
                    this.projects.splice(i, 1);
                }
            }
        } else {
            console.log('Couldn\'t find project locally to remove');
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
    }
}