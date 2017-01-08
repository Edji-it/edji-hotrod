/**
 *  Annotator Component
 *  - Loads Reading text
 *  - Compiles word components
 *  - Triggers highlighting
 *  - Deletes highlights and comment components
 */
import { Component, Input, OnDestroy, OnInit, ViewChildren, QueryList } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import * as Rangy from 'rangy';

import { ReadingService } from '../shared/reading.service';
import { ProjectService } from '../shared/project.service';
import { CommentComponent } from './comment';
import { AuthService } from '../shared/auth.service';

@Component({
    selector: 'annotator',
    templateUrl: 'annotator.component.html',
    styleUrls: ['annotator.component.scss']
})
export class AnnotatorComponent implements OnInit, OnDestroy {
    @Input() private project: any;

    @ViewChildren(CommentComponent) commentComponents: QueryList<CommentComponent>;

    private reading: any = {};
    
    private commentsByIndex: any[] = [];
    private highlightArray: number[] = [];
    private lineCountArray: any[][] = [];
    private lineCountRunning: boolean = false;

    private activeComment: any = {};
    
    private lineExpanded: boolean = false;
    private showCommentCounts: boolean = false;
    private showAllComments: boolean = false;

    private highlightY = '100px'; 
    private optionsShow = false;

    private loadingReading = true;

    private subscriptions: Subscription[] = [];

    // For converting old Readings
    private words: any[] = [];

    // For verifying comment ownership
    private user: any;

    constructor(
        private _readings: ReadingService,
        private _projects: ProjectService,
        private _auth: AuthService
    ) { }
 
    ngOnInit() {
        this.user = this._auth.getUser();

        // Get Reading via Observable
        this.subscriptions.push(
            this._readings.get(this.project.reading_id)
                .subscribe(
                    reading => {
                        if (!reading.words || reading.words.length < 1) {
                            this.reading = this.processOldReading(reading);
                        } else {
                            this.reading = reading;
                        }
                    },
                    error => {
                        console.error(error);
                    }
                )
        );
        
        // Populate local Comment and Highlight arrays
        // (Used for super speedy rendering!)
        this.project.comments.forEach(comment => {
            // If student, only show the student's comments
            if (comment.user_id === this.user._id || this.user.isTeacher === true) {
                if (!this.commentsByIndex[comment.start]) {
                    this.commentsByIndex[comment.start] = [];
                }
                // Populate local comments array by start index
                comment.project_id = this.project._id;
                this.commentsByIndex[comment.start].push(comment);

                // Add highlights
                this.incrementHighlights(comment.start, comment.end);
            }
        });

        // After comments are added to the array
        this.updateAllLineCounts();

        window.onresize = () => {
            this.updateAllLineCounts();
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
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

    updateAllLineCounts(): void {
        this.lineCountArray = [];
        if (!this.lineCountRunning) {
            this.lineCountRunning = true;
            // TEMPORARY: Add delay so element is rendered
            setTimeout(() => {
                if (this.commentComponents) {
                    this.commentComponents.toArray().forEach(
                        (commentComp: CommentComponent, index: number) => {
                            let yPos = commentComp.getVerticalPosition();
                            
                            if (yPos > 0) { // 0 is returned as the default
                                if (this.lineCountArray[yPos]) {
                                    this.lineCountArray[yPos].push(commentComp);
                                } else {
                                    this.lineCountArray[yPos] = [commentComp];
                                }
                                commentComp.lineCount = this.lineCountArray[yPos].length;
                            }
                        }
                    );
                }
                this.lineCountRunning = false;
            }, 2000);
        }
    }

    /** 
     * Fired by Output from the Comment Component
     * - References lineCountArray
     */
    expandLine(yPosToExpand: number) {
        console.log(yPosToExpand);
        console.log(this.lineCountArray[yPosToExpand]);
        if (this.lineCountArray[yPosToExpand]) {
            this.lineCountArray[yPosToExpand].forEach( (comment, index) => {
                comment.expanded = !comment.expanded;
            });
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
            // Any time we decrement, we should ensure we remove the 1000 focus
            if (this.highlightArray[i] >= 1000) {
                this.highlightArray[i] -= 1000;
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
        let text: string = '';
        for (var i = start; i <= end; i++) {
            text += this.reading.words[i].str;
        }

        // Tell server we've added a comment
        this._projects.saveComment(projectId, '', start, end, type, text)
            .then(comment => {
                // We add the comment from the service because it has an Id
                if (comment._id) {
                    // Add setting to trigger focus on new comment
                    this.inactivateComment();
                    
                    // Give it the Project Id to pass down to the Comment Component
                    comment.project_id = this.project._id;
                    
                    // Add Comment to local array
                    if (this.commentsByIndex[start]) {
                        this.commentsByIndex[start].push(comment);
                        this.setActiveCommentByIndex(true, start, this.commentsByIndex[start].length - 1);
                    } else {
                        this.commentsByIndex[start] = [ comment ];
                        this.setActiveCommentByIndex(true, start, 0);
                    }
                    this.updateAllLineCounts();
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

        // Clear active comment
        this.inactivateComment();
        // Remove highlights from local array
        this.decrementHighlights(comment.start, comment.end);
        // Remove comment form local Comments array
        this.commentsByIndex[index].splice(commentIndex);
        // Update line counts
        this.updateAllLineCounts();
    }

    setActiveCommentByIndex(isActive: boolean, wordIndex: number, commentIndex: number): void {
        if (isActive) {
            this.inactivateComment();
            this.activeComment = this.commentsByIndex[wordIndex][commentIndex];
            this.activeComment.active = true;
        } else {
            this.inactivateComment();
        }
    }

    inactivateComment():void {
        this.activeComment.active = false;
        this.activeComment = {};
    }

    /**
     * Receive comment data from input sources:
     * - Gets event from Emoji Keyboard
     */
    updateActiveComment(commentData: string) {
        this.activeComment.data = commentData;
    }

    /** 
     * Add Comment of Emoji type
     * - Fired from comment options tooltip
     */
    addEmojiComment(event): void {
        // Get selection indices
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

        // Hide tool tips
        this.hideCommentOptions();
        // Clear selections
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

    /** 
     * Add Comment of Emoji type
     * - Fired from comment options tooltip
     */
    addTextComment(event): void {
        // Get selection indices
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

        // Hide tool tips
        this.hideCommentOptions();
        // Clear selections
        selection.removeAllRanges();

        // It's possible that a selection is made backwards
        // We want the start index to come first
        if (start > end) {
            end = [start, start = end][0]; // Swap start and end values
        }
        
        // Increment highlight array
        this.incrementHighlights(start, end);

        // Tell the server we've got a comment!
        this.createComment(start, end, 'text');
    }

    /** 
     * Process Readings that don't yet have a Words array!
     * - Can be deprecated eventually
     */
    processOldReading(reading: any) : any {
        // Clear parsed words array
        this.words = [];

        // Process reading html into useful Words Array
        let el = document.createElement('div');
        el.innerHTML = reading.html;
        let readingHtml = el;
        let childEls = readingHtml.childNodes;

        // Loop through all Reading html elements
        for (let i = 0; i < childEls.length; i++) {
            this.extractTextNodes(childEls[i]);
        }

        reading.words = this.words;

        // Save processed reading with Words array
        this._readings.save(reading)
            .toPromise()
            .then(data => {
                // we don't really care if we get data back
            });

        return reading;
    }

    /**
     * Loops through child elements to find textnodes
     * Pushes text nodes as formatted objects into this.words
     * @param element Root element to start crawling from
     */
    private extractTextNodes(element: any, ancestorTags ?: string[]) {
        let tagName = element.tagName.toLowerCase();
        let nodes = element.childNodes;
        
        // Children should inherit tags from several elements up
        // eg. "B" style should propagate down
        if (!ancestorTags) {
            ancestorTags = [];
        } 

        if (ancestorTags.indexOf(tagName) < 0) {
            ancestorTags.push(tagName);
        }

        nodes.forEach((node, index) => {
            // Copy tags array to variable local to loop instance
            let inheritedTags = ancestorTags.slice();

            if (node.nodeType === 3) {
                // Found a text node!

                // Split text inside child nodes
                let nodeWords = node.textContent.split(/(?:([^a-zA-Z0-9]))/).filter(function(el){ return el.replace(/([\n])/g, ''); } );  
                
                // If empty element, push a spacer word to reflect that
                if (nodeWords.length < 1) {
                    this.words.push({
                        str: '',
                        styles: ['space', 'space-first', 'space-last'].concat(inheritedTags)
                    });
                }

                // Otherwise loop through words, and process into array
                nodeWords.forEach((nodeWord, wIndex) => {
                    let word = {
                        str : nodeWord,
                        styles: [].concat(inheritedTags)
                    };
                    if (word.str.trim().length < 1) {
                        word.styles.push('space');
                    }
                    if (index == 0 && wIndex == 0) {
                        word.styles.push(tagName + '-first');
                    }
                    if (index == nodes.length - 1 && wIndex == nodeWords.length - 1) {
                        word.styles.push(tagName + '-last');
                    }
                    this.words.push(word);
                });
            } else {
                // If not a text node, dig deeper for text nodes
                this.extractTextNodes(node, inheritedTags);
            }
        });
    }

    private focusHighlight(start, end): void {
        for (var i = start; i <= end; i ++) {
            if (this.highlightArray[i]) {
                this.highlightArray[i] += 1000;
            } else {
                this.highlightArray[i] = 1000;
            }
        }
    }

    private unfocusHighlight(start, end): void {
        for (var i = start; i <= end; i ++) {
            if (this.highlightArray[i] >= 1000) {
                this.highlightArray[i] -= 1000;
            } else {
                this.highlightArray[i] = 0;
            }
        }
    }

    /**
     * Keep this light! It runs for every word instance
     * @param i is the word index
     */
    private getHighlightClass(i: number): string {
        let classString = '';
        if (this.highlightArray[i]) {
            if (this.highlightArray[i] >= 1000) {
                // Focus style
                classString = 'highlight-f highlight-' + (this.highlightArray[i] - 1000);
            } else {
                classString = 'highlight-' + this.highlightArray[i];
            }
        }
        return classString;
    }
}