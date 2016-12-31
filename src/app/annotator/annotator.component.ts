/**
 *  Annotator Component
 *  - Loads Reading text
 *  - Compiles word components
 *  - Triggers highilghting
 */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { ReadingService } from '../shared/reading.service';

@Component({
    selector: 'annotator',
    templateUrl: 'annotator.component.html',
    styleUrls: ['annotator.component.scss']
})
export class AnnotatorComponent implements OnInit, OnDestroy {
    // Component input
    @Input()
    private project: any;

    private reading: any = {};

    private lineExpanded: boolean = false;
    private showCommentCounts: boolean = false;
    private showAllComments: boolean = false;

    private highlightY = '100px'; 
    private optionsShow = false;

    private loadingReading = true;

    private subscriptions: Subscription[] = [];

    constructor(private _readings: ReadingService) { }
 
    ngOnInit() {
        console.log(this.project);
        // Get Reading via Observable
        this.subscriptions.push(
            this._readings.get(this.project.reading_id)
                .subscribe(
                    reading => {
                        console.log(reading);
                        this.reading = reading;
                    },
                    error => {
                        console.error(error);
                    }
                )
        );
        
    }
    
    ngOnDestroy() {
        
    }

    hideCommentOptions(event) {
        this.optionsShow = false;
    }

    showCommentOptions(event) {
        console.log("See youuu");
        console.log(event);
        this.highlightY = event.clientY + 'px';
        console.log(this.highlightY);
        this.optionsShow = true;
    }
}