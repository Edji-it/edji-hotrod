/**
 *  Annotator Component
 *  - Loads Reading text
 *  - Compiles word components
 *  - Triggers highlighting
 *  - Deletes highlights and comment components
 */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import * as Rangy from 'rangy';

import { ReadingService } from '../shared/reading.service';
import { ProjectService } from '../shared/project.service';

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
    
    private commentsByIndex: any[] = [];
    private highlightArray: number[] = [];
    
    private lineExpanded: boolean = false;
    private showCommentCounts: boolean = false;
    private showAllComments: boolean = false;

    private highlightY = '100px'; 
    private optionsShow = false;

    private loadingReading = true;

    private subscriptions: Subscription[] = [];


    constructor(
        private _readings: ReadingService,
        private _projects: ProjectService
    ) { }
 
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
        
        // Populate local Comment and Highlight arrays
        // (Used for super speedy rendering!)
        this.project.comments.forEach(comment => {
            if (!this.commentsByIndex[comment.start]) {
                this.commentsByIndex[comment.start] = [];
            }
            // Populate local comments array by start index
            this.commentsByIndex[comment.start].push(comment);

            // Add highlights
            this.incrementHighlights(comment.start, comment.end);
        });

    }
    
    ngOnDestroy() {
        
    }
    
    hideCommentOptions(event ?): void {
        this.optionsShow = false;
    }

    /**
     * Show tooltip to the side with buttons for adding comment types
     */
    showCommentOptions(event): void {
        // Only show options if text selected
        if (Rangy.getSelection() && Rangy.getSelection().toString().length > 0) {
            this.highlightY = event.clientY + 'px';
            this.optionsShow = true;
        } else {
            this.optionsShow = false;
        }
    }

    /**
     * Add new highlights to local array
     */
    incrementHighlights(start: number, end: number): void {
        for (var i = start; i <= end; i ++) {
            if (this.highlightArray[i]) {
                this.highlightArray[i]++;
            } else {
                this.highlightArray[i] = 1;
            }
        }
    }

    /**
     * Removes highlights from local array
     */
    decrementHighlights(start: number, end: number): void {
        for (var i = start; i <= end; i ++) {
            if (this.highlightArray[i] && this.highlightArray[i] > 0) {
                this.highlightArray[i]--;
            } else {
                this.highlightArray[i] = 0;
            }
        }
    }

    /**
     * Create a Comment of any Type
     * Requires three parameters, and finds the other information it needs
     * @param start Index of first word
     * @param end Index of last word
     * @param type What kind of comment: emoji, text...
     */
    createComment(start: number, end: number, type: string): void {
        let projectId = this.project._id;
        let text = this.reading.words.slice(start, end).toString();

        // Tell server we've added a comment
        this._projects.saveComment(projectId, '', start, end, text)
            .then(comment => {
                // We add the comment from the service because it has an Id
                if (comment._id) {
                    // Add setting to trigger focus on new comment
                    comment.isNew = true;
                    // Add Comment to local array
                    if (this.commentsByIndex[start]) {
                        this.commentsByIndex[start].push(comment);
                    } else {
                        this.commentsByIndex[start] = [ comment ];
                    }
                } else {
                    console.warn('Didn\'t get a comment back from server!');
                }
            })
            .catch(error => {
                // We should figure out how to handle this properly!
                // Maybe show a warning icon?
                console.warn(error);
            });
    }

    /**
     * Fires after the comment has been deleted in the database
     * - Removes comment from locally transformed array (commentsByIndex)
     * - De-increments the highlights
     */
    commentsByIndexRemove(commentId, index: number, commentIndex: number) {
        let comment = this.commentsByIndex[index][commentIndex];
        // Remove highlights from local array
        this.decrementHighlights(comment.start, comment.end);
        // Remove comment form local Comments array
        this.commentsByIndex[index].splice(commentIndex);
    }

    /** 
     * Add Comment of Emoji type
     * - Fired from comment options tooltip
     */
    addEmojiComment(event): void {
        // Get selection indices
        console.log(Rangy.getSelection());
        let selection = Rangy.getSelection();
        let start : number;
        let end : number;
        let comment: any;
        
        let getNodeIndex = function(node: any) : number {
            // Selections often happen at the text node level, inside the actual element
            // In which case we need to reference its parent node
            if(node.hasOwnProperty('className') && node.className.indexOf('word') > -1) {
                return parseInt(node.getAttribute('index'));
            } else {
                return parseInt(node.parentNode.getAttribute('index'));
            }
        }

        start = getNodeIndex(selection['anchorNode']);
        end = getNodeIndex(selection['focusNode']);

        // Clear selection and hide tooltip
        this.hideCommentOptions();
        selection.removeAllRanges();

        // It's possible that a selection is made backwards
        // We want the start index to come first
        if (start > end) {
            end = [start, start = end][0]; // Swap start and end values
        }
        
        // Increment highlight array
        this.incrementHighlights(start, end);

        // Tell the server we've got a comment!
        this.createComment(start, end, 'emoji');
    }
}