import { AuthService } from '../shared/auth.service';
import { Observable, Subscription } from 'rxjs/Rx';
import { ActivatedRoute, Params } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

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

    constructor(private _route: ActivatedRoute, private _readings: ReadingService, private _projects: ProjectService, private _auth: AuthService) {
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

    ngOnInit() {
 
    }

    getReading(readingId) {
        this.subscriptions
            .push(
                this._readings.get(readingId)
                    .subscribe(
                        data => {
                            this.reading = data;
                        },
                        err => {
                            console.log(err);
                        })
            );
        this.subscriptions
            .push(
                this._projects.getForReading(readingId)
                    .subscribe(
                        data => {
                            if (data.json() instanceof Array) {
                                this.projects = data.json();
                            }
                        },
                        err => {
                            console.log(err);
                        }
                    )
            );
    }

    addNewProject(newProject) {
        if (!newProject.label || newProject.label.length < 1) {
            this.projectErr.error = "A project label is required!";
            return;
        }
        this.addingNew = true;

        // New Projects require a teacher id
        newProject['teacher_id'] = this._auth.getUser()._id;

        this._projects.new(this.readingId, newProject)
            .then(data => {
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
    removeProject(project) {
        console.log(this.projects);
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

    // deleteModal(id, label, index) {
        
    // }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
    }
}