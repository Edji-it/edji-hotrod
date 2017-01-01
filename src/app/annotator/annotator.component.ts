/**
 *  Annotator Component
 *  - Loads Reading text
 *  - Compiles word components
 *  - Triggers highilghting
 */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import * as Rangy from 'rangy';

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

    private highlightArray: number[] = [ 0, 0, 1, 2, 2, 3, 0, 0];

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

    /**
     * Show tooltip to the side with buttons for adding comment types
     */
    showCommentOptions(event) {
        console.log("See youuu");
        this.highlightY = event.clientY + 'px';
        this.optionsShow = true;
    }

    /** 
     * Add Comment of Emoji type
     * - Fired from comment options tooltip
     */
    addEmojiComment(event) {
        // Get selection indices
        console.log(Rangy.getSelection());
        let range = Rangy.getSelection();
        let start : number;
        let end : number;
        
        let getNodeIndex = function(node: any) : number {
            // Selections often happen at the text node level, inside the actual element
            // In which case we need to reference its parent node
            if(node.hasOwnProperty('className') && node.className.indexOf('word') > -1) {
                return parseInt(node.getAttribute('index'));
            } else {
                return parseInt(node.parentNode.getAttribute('index'));
            }
        }

        start = getNodeIndex(range['anchorNode']);
        end = getNodeIndex(range['focusNode']);

        // It's possible that a selection is made backwards
        // We want the start index to come first
        if (start > end) {
            end = [start, start = end][0]; // Swap start and end values
        }
        
        console.log(start,end);
        // Increment highlight array
        for (var i = start; i <= end; i ++) {
            if (this.highlightArray[i]) {
                this.highlightArray[i]++;
            } else {
                this.highlightArray[i] = 1;
            }
        }

    }
}