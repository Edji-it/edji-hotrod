/**
 *  Annotator Component
 *  - Loads Reading text
 *  - Compiles word components
 *  - Triggers highlighting
 *  - Deletes highlights and comment components
 */
import { Component, Input, OnDestroy, OnInit, ViewChildren, QueryList, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import * as Rangy from 'rangy';
import { Angulartics2 } from 'angulartics2';
// import { HotkeysService, Hotkey } from 'angular2-hotkeys';

import { ReadingService } from '../shared/reading.service';
import { ProjectService } from '../shared/project.service';
import { CommentComponent } from './comment';
import { AuthService } from '../shared/auth.service';
import { SocketService } from '../shared/socket.service';
import { CommentPermissions } from './comment';

@Component({
    selector: 'annotator',
    templateUrl: 'annotator.component.html',
    styleUrls: ['annotator.component.scss']
})
export class AnnotatorComponent implements OnInit, OnDestroy {
    @Input() private project: any;
    @Input() private mobileCommentActive: boolean;

    @ViewChildren(CommentComponent) commentComponents: QueryList<CommentComponent>;


    private reading: any = {};
    
    private commentsByIndex: any[] = [];

    private highlightArray: number[] = [];
    private alwaysHighlightArray: number[] = [];
    private focusArray: boolean[] = [];
    
    // An array of arrays!
    private lineCountArray: any[][] = [];
    private lineCountRunning: boolean = false;

    private activeComment: any = {};
    
    private lineExpanded: boolean = false;
    private showCommentCounts: boolean = false;
    private showAllComments: boolean = false;

    private highlightY = '200px'; 
    private highlightX = '20px'; 
    private optionLeft = true;
    private isMobile = false;
    private optionsShow = false;
    private mobileIndex = 0;
    private hideKeyboard = false;

    private imageCoords = {};
    private imageHotspotPlaceholder: any = {
        index: -1,
        x: 0,
        y: 0,
        focus: false,
        preview: false
    };

    private subscriptions: Subscription[] = [];

    // For converting old Readings
    private words: any[] = [];

    // For verifying comment ownership
    private user: any;

    // For mobile display of comments
    private foundArray: any[] = [];

    // Publically available stats
    public commentStats = {
        count: 0,
        users: [],
        userRef: {}
    };

    constructor(
        private _readings: ReadingService,
        private _projects: ProjectService,
        private _auth: AuthService,
        private _socket: SocketService,
        private angulartics: Angulartics2
        // private _hotkeysService: HotkeysService
    ) {
        // this._hotkeysService.add(new Hotkey('t', (event: KeyboardEvent): boolean => {
        //      this.addTextComment({ name: 'Hotkey'});
        //     return false; // Prevent bubbling
        // }));
        // this._hotkeysService.add(new Hotkey('e', (event: KeyboardEvent): boolean => {
        //      this.addEmojiComment({ name: 'Hotkey'});
        //     return false; // Prevent bubbling
        // }));
    }
    
    ngOnInit() {
        // this.user = this._auth.getUser();

        /** Set the current user every time it changes */
        this.subscriptions.push(
            this._auth.getCurrentUser().subscribe((user) => {
                this.user = user;
            })
        );

        // Check if mobile
        if (window.screen.availWidth < 768) {
            this.isMobile = true;
        }

        // Get Reading via Observable
        this._readings.get(this.project.reading_id)
            .take(1)
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

        // Establish Users array
        if (this.project.student_ids) {
            this.project.student_ids.forEach(student => {
                this.commentStats.userRef[student._id] = this.commentStats.users.length;
                this.commentStats.users.push(  { _id: student._id, type: 'user', name: (student.fullname ? student.fullname : student.username), count: 0 } );
            });
        }
        if (this.project.temp_ids) {
            this.project.temp_ids.forEach(temp => {
                this.commentStats.userRef[temp._id] = this.commentStats.users.length;
                this.commentStats.users.push({ _id: temp._id, type: 'temp', name: temp.fullname, count: 0 });
            });
        }  

        // Populate local Comment and Highlight arrays
        // (Used for super speedy rendering!)
        this.project.comments.forEach(comment => {
            // Show comments if in heat mode, 
            // if (this.project.heat_vision || comment.user_id === this.user._id || this.user._id === this.project.teacher_id || comment.user_id === this.project.teacher_id) {
                if (!this.commentsByIndex[comment.start]) {
                    this.commentsByIndex[comment.start] = [];
                }
                // Populate local comments array by start index
                this.decorateComment(comment);
                this.commentsByIndex[comment.start].push(comment);
                
                // Add highlights
                this.incrementHighlights(this.user._id === comment.user_id || this.project.teacher_id == comment.user_id, comment.start, comment.end);
            // }

            // Populate Stats
            this.updateCommentStats(comment.user_id, 1, comment.author);
        });

        // Share updated CommentStats
        this._projects.setCommentStats(this.commentStats);

        // Subscribe to comment comment updates
        this.subscriptions.push(
            this._socket.commentUpdates().subscribe((commentUpdate) => {
                let comment = commentUpdate.comment;
                let wIndex = comment.start;
                let cIndex = -1;

                // Get local array index
                if (this.commentsByIndex[wIndex]) {
                    for (var i = 0; i < this.commentsByIndex[wIndex].length; i++) {
                        let commentRef = this.commentsByIndex[wIndex][i];
                        if (commentRef._id === comment._id) {
                            cIndex = i;
                        }
                    }
                }
                console.log(this.project.comments);
                
                // Process different live comment updates
                if (commentUpdate.action === 'DELETE') {
                    if (cIndex > -1) {
                        // Remove highlights from local array
                        this.decrementHighlights(this.user._id === comment.user_id || this.project.teacher_id == comment.user_id, comment.start, comment.end);
                        this.commentsByIndexRemove(comment._id, wIndex, cIndex);
                        //this.updateCommentStats(comment.user_id, -1, comment.author);
                    }
                } else if (commentUpdate.action === 'UPDATE') {
                    if (cIndex > -1 && this.commentsByIndex[wIndex] && this.commentsByIndex[wIndex][cIndex]) {
                        this.commentsByIndex[wIndex][cIndex].data = comment.data;
                    } else {
                        // Sometimes an UPDATE comes through for comment not yet created
                        // Add highlights to local array
                        this.incrementHighlights(this.user._id === comment.user_id || this.project.teacher_id == comment.user_id, comment.start, comment.end);
                        this.commentsByIndexAdd(comment, wIndex, true);
                        //this.updateCommentStats(comment.user_id, 1, comment.author);
                    }
                } else if (commentUpdate.action === 'CREATE') {
                    // Add highlights to local array
                    this.incrementHighlights(this.user._id === comment.user_id || this.project.teacher_id == comment.user_id, comment.start, comment.end);
                    this.commentsByIndexAdd(comment, wIndex, true);
                    //this.updateCommentStats(comment.user_id, 1, comment.author);
                }
            }, (error) => {
                console.warn(error);
            })
        );

        // Subscribe to Heat Vision toggle updates
        this.subscriptions.push(
            this._socket.heatVisionUpdates().subscribe((heatToggle) => {
                this.project.heat_vision = heatToggle.heatVision.all;
                this.updateAllLineCounts();
            })
        );

        // After comments are added to the array
        this.updateAllLineCounts();

        // Hacky McHackFace since comments render later (especially lots of comments)
        for (var i = 0; i <= 3; i++) {
             setTimeout(() => {
                this.updateAllLineCounts();
             }, ( 1000*i - 1000) );
        }
       

        window.onresize = () => {
            this.updateAllLineCounts();
        }

        // Fallback for tooltip: Continuous text selection check
        this.loopCheckTextSelection();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
    }
    
    hideCommentOptions(event ?): void {
        this.optionsShow = false;
    }

    /**
     * This is the source of our CommentStats object!
     */
    updateCommentStats(user_id: string, difference: number, name ?: string): void {
        let i = this.commentStats.userRef[user_id];
        if (i > -1) {
            this.commentStats.users[i].count += difference;
        } else {
            // Add user ref index
            this.commentStats.userRef[user_id] = this.commentStats.users.length;
            // Add user stat object
            this.commentStats.users.push(  { _id: user_id, name: name, count: difference > 0 ? 1 : 0 } );
        }
        this.commentStats.count += difference;
        this._projects.setCommentStats(this.commentStats);
    }

    /**
     * Show tooltip to the side with buttons for adding comment types
     */
    showCommentOptions(event, doNotDismiss ?: boolean): void {
        // Only show options if text selected
        let annotatorPaper = document.getElementById('emojiAnnotator');
        let annotatorContent = document.getElementById('annotatorContent');
        let sel = Rangy.getSelection();
        // console.log(sel);
        
        // Make sure selection exists, and is within highlightable content
        if (sel && sel.toString().length > 0 
                && Rangy.dom.isAncestorOf(annotatorContent, sel.focusNode)
                && Rangy.dom.isAncestorOf(annotatorContent, sel.anchorNode)
            ) {
            let scrollOffset = annotatorPaper.getBoundingClientRect().top;
            const readingPad = 52;
            let focusY;
            if (!!sel.focusNode.getBoundingClientRect) {
                focusY = sel.focusNode.getBoundingClientRect().top;
            } else {
                focusY = sel.focusNode.parentNode.getBoundingClientRect().top;
            }
            this.highlightY = (focusY - scrollOffset + readingPad) + 'px';
            // If in mobile
            if (window.screen.availWidth < 768) {
                this.isMobile = true;
                if (event.clientX < 120) {
                    this.optionLeft = false;
                    this.highlightX = (180 - event.clientX) + 'px';
                } else {
                    this.optionLeft = true;
                    this.highlightX = (event.clientX + readingPad - 80) + 'px';
                }
            } else {
                this.isMobile = false;
            }
            this.optionsShow = true;
        } else if (!doNotDismiss) {
            this.optionsShow = false;
            this.imageHotspotPlaceholder.preview = false;
        }
    }

    loopCheckTextSelection(): void {
        setTimeout(() => {
            this.showCommentOptions({ name: 'timeout'});
            this.loopCheckTextSelection();
        }, 500);
    }

    updateAllLineCounts(): void {
        if (!this.lineCountRunning) {
            this.lineCountArray = [];
            this.lineCountRunning = true;
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

            // Sometimes comments render late
            setTimeout(() => {
                this.updateAllLineCounts();
            }, 2000);
            this.lineCountRunning = false;
        }
    }

    /** 
     * Fired by Output from the Comment Component
     * - References lineCountArray
     */
    expandLine(yPosToExpand: number, forceSet ?: boolean) {
        if (this.lineCountArray[yPosToExpand]) {
            this.lineCountArray[yPosToExpand].forEach( (comment, index) => {
                if (typeof(forceSet) !== 'undefined') {
                    comment.expanded = forceSet;
                } else {
                    comment.expanded = !comment.expanded;
                }
            });
        }
    }

    /**
     * Add new highlights to local array
     */
    incrementHighlights(alwaysHighlight: boolean, start: number, end: number): void {
        if (alwaysHighlight) {
            for (var i = start; i <= end; i ++) {
                if (this.alwaysHighlightArray[i]) {
                    this.alwaysHighlightArray[i]++;
                } else {
                    this.alwaysHighlightArray[i] = 1;
                }
            }
        } else {
            for (var i = start; i <= end; i ++) {
                if (this.highlightArray[i]) {
                    this.highlightArray[i]++;
                } else {
                    this.highlightArray[i] = 1;
                }
            }
        }
    }

    /**
     * Removes highlights from local array
     */
    decrementHighlights(alwaysHighlight: boolean, start: number, end: number): void {
        if (alwaysHighlight) {
            for (var i = start; i <= end; i ++) {
                // Any time we decrement, we should ensure we remove the 1000 focus
                if (this.alwaysHighlightArray[i] >= 1000) {
                    this.alwaysHighlightArray[i] -= 1000;
                }

                if (this.alwaysHighlightArray[i] && this.alwaysHighlightArray[i] > 0) {
                    this.alwaysHighlightArray[i]--;
                } else {
                    this.alwaysHighlightArray[i] = 0;
                }
            }
        } else {
            for (var i = start; i <= end; i ++) {
                // Any time we decrement, we should ensure we remove the 1000 focus
                if (this.highlightArray[i] >= 1000) {
                    this.highlightArray[i] -= 1000;
                }

                if (this.highlightArray[i] && this.highlightArray[i] > 0) {
                    this.highlightArray[i]--;
                } else {
                    this.highlightArray[i] = 0;
                }
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
        // We need to make sure they aren't already editing a comment
        this.inactivateComment();

        let projectId = this.project._id;
        let text: string = '';
        for (var i = start; i <= end; i++) {
            text += this.reading.words[i].str;
        }

        this.angulartics.eventTrack.next({ action: type + 'CommentCreate', properties: { category: 'projectAction', label: 'attempt' }});
        
        // Tell server we've added a comment
        this._projects.saveComment(projectId, '', start, end, type, text, null, this.imageCoords)
            .then(comment => {
                // We add the comment from the service because it has an Id
                if (comment._id) {
                    this.angulartics.eventTrack.next({ action: type + 'CommentCreate', properties: { category: 'projectAction', label: 'attempt' }});
                    // Check if comment should start expanded
                    if (document.querySelector('.word[index="' + start + '"] .comment')) {
                        let commentY = document.querySelector('.word[index="' + start + '"] .comment')['offsetTop'];

                        if (this.lineCountArray[commentY] && this.lineCountArray[commentY][0].expanded) {
                            comment.expanded = true;
                            comment.lineCount = this.lineCountArray[commentY].length + 1;
                        }
                    }
                    // Add setting to trigger focus on new comment
                    comment.new = true; // this is basically to tell our test cases which comment was just made
                    this.inactivateComment();
                    this.commentsByIndexAdd(comment, start);
                } else {
                    console.warn('Didn\'t get a comment back from server!');
                }
            })
            .catch(error => {
                // TRACK EXCEPTION
                this.angulartics.eventTrack.next({ action: type + 'CommentCreate', properties: { category: 'projectAction', label: 'failure' }});
                // We should figure out how to handle this properly!
                // Maybe show a warning icon?
                console.warn(error);
            });
    }

    commentsByIndexAdd(comment, index: number, addQuietly ?: boolean): void {
        let start = comment.start;
        // Give it the Project Id to pass down to the Comment Component
        this.decorateComment(comment);
        
        // Add Comment to local array
        if (this.commentsByIndex[start]) {
            this.commentsByIndex[start].push(comment);
            if (addQuietly !== true) { 
                this.setActiveCommentByIndex(true, start, this.commentsByIndex[start].length - 1);
            }
        } else {
            this.commentsByIndex[start] = [ comment ];
            if (addQuietly !== true) { 
                this.setActiveCommentByIndex(true, start, 0);
            }
        }
        this.updateAllLineCounts();
        this.updateCommentStats(comment.user_id, 1, comment.author);
    }

    private decorateComment(comment: any) {
        comment.project_id = this.project._id;
        if (comment.user_id === this.user._id || comment.user_id === this.project.teacher_id) {
            comment.showAvatar = true;
        }
    }

    /**
     * Removes comment from locally transformed array (commentsByIndex)
     */
    commentsByIndexRemove(commentId, index: number, commentIndex: number) {
        let comment = this.commentsByIndex[index][commentIndex];
        
        if (!comment) {
            return;
        }
        // Clear active comment
        this.inactivateComment();
        // Remove comment form local Comments array
        this.commentsByIndex[index].splice(commentIndex,1);
        // Update line counts
        this.updateAllLineCounts();
        this.updateCommentStats(comment.user_id, -1, comment.author);
    }

     /**
     * Fires after the comment has been deleted in the database
     * - Removes comment from locally transformed array (commentsByIndex)
     * - De-increments the highlights
     */
    removeComment(comment, index: number, commentIndex: number) {
        // Remove Highlights
        this.decrementHighlights(this.user._id === comment.user_id, comment.start, comment.end);
        // Remove local comment object
        this.commentsByIndexRemove(comment.id, index, commentIndex);
        this.unfocusHighlight(comment.start, comment.end)
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
        this.unfocusHighlight(this.activeComment.start, this.activeComment.end);
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
     * Returns Start and End word indices of text selection
     */
    getSelectionSpan(): any {
        let selection = Rangy.getSelection();
        let start : number;
        let end : number;
        let comment: any;
        
        let getNodeIndex = function(node: any) : number {

            // Selections often happen at the text node level, inside the actual element
            // In which case we need to reference its parent node
            // Note: we tried node.hasOwnProperty here and would sometimes get a false true resolution of the if statement... not sure how that is possible
            if(!!node.className && node.className.indexOf('word') > -1) {
                return parseInt(node.getAttribute('index'));
            } else {
                return parseInt(node.parentNode.getAttribute('index'));
            }
        }

        if (selection['anchorNode'] && selection['focusNode']) {
            start = getNodeIndex(selection['anchorNode']);
            end = getNodeIndex(selection['focusNode']);
            
            // It's possible that a selection is made backwards
            // We want the start index to come first
            if (start > end) {
                end = [start, start = end][0]; // Swap start and end values
            }
            // Hide tool tips
            this.hideCommentOptions();
            // Clear selections
            selection.removeAllRanges();
        }
        
        return { 'start': start, 'end': end };
    }

    /** 
     * Add Comment of Emoji type
     * - Fired from comment options tooltip
     */
    addEmojiComment(event): void {
    // console.log(Rangy.getSelection().anchorNode);

        // Get selection indices
        let span = this.getSelectionSpan();
        
        if ( !(span.start >= 0) || !(span.end >= 0)) {
            return;
        }
        
        // Increment highlight array
        this.incrementHighlights(true, span.start, span.end);

        // Tell the server we've got a comment!
        this.createComment(span.start, span.end, 'emoji');
    }

    /** 
     * Add Comment of Emoji type
     * - Fired from comment options tooltip
     */
    addTextComment(event): void {
        // Get selection indices
        let span = this.getSelectionSpan();

        if ( !(span.start >= 0) || !(span.end >= 0)) {
            return;
        }
        
        // Increment highlight array
        this.incrementHighlights(true, span.start, span.end);

        // Tell the server we've got a comment!
        this.createComment(span.start, span.end, 'text');
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
                    let addBr = false;
                    if (word.str.trim().length < 1) {
                        word.styles.push('space');
                    }
                    if (index == 0 && wIndex == 0) {
                        word.styles.push(tagName + '-first');
                    }
                    if (index == nodes.length - 1 && wIndex == nodeWords.length - 1) {
                        word.styles.push(tagName + '-last');
                        addBr = true;
                    }
                    this.words.push(word);
                    if (addBr) {
                        // Add break element
                        this.words.push({
                            str: '',
                            styles: ['br']
                        });
                    }
                });
            } else {
                // If not a text node, dig deeper for text nodes
                this.extractTextNodes(node, inheritedTags);
            }
        });
    }

    /**
     * Adds focus text highlighted for the relevant comment
     * @param start Index for first word
     * @param end Index for last word
     */
    private focusHighlight(start, end, location ?: any): void {
        for (var i = start; i <= end; i ++) {
            // if (this.focusArray[i]) {
                this.focusArray[i] = true;
            // } else {
            //     this.focusArray[i] = false;
            // }
        }
        if (location && location.x && location.y) {
            this.imageHotspotPlaceholder = {
                index: start,
                x: location.x,
                y: location.y,
                focus: true
            };
        }
    }

    /**
     * Removes a class to focus text highlighted for the relevant comment
     * @param start Index for first word
     * @param end Index for last word
     */
    private unfocusHighlight(start, end, location ?: any): void {
        for (var i = start; i <= end; i ++) {
            // if (this.focusArray[i] = true) {
                this.focusArray[i] = false;
            // } 
        }
            this.imageHotspotPlaceholder['focus'] = false;
    }

    /**
     * Keep this light! It runs for every word instance
     * @param i is the word index
     */
    private getHighlightClass(i: number): string {
        let classString = '';
        let highlightCount = 0;
        let focusHighlight = false;

        if ((this.project.heat_vision || this.user._id == this.project.teacher_id) && this.highlightArray[i]) {
            highlightCount += this.highlightArray[i];
        }
        if (this.alwaysHighlightArray[i]) {
            // AlwaysHighlight also tracks focused words
            // if (this.alwaysHighlightArray[i] >= 1000) {
            //     // Focus style
            //     focusHighlight = true;
            //     highlightCount += (this.alwaysHighlightArray[i] - 1000);
            // } else {
                highlightCount += this.alwaysHighlightArray[i];
            // }
        }
        if (this.focusArray[i]) {
            classString = 'h-f';
        }
        return classString + ' h-' + highlightCount;
    }

    private imageCommentOptions(imageIndex: number, word: any, event: Event) : void {
        // when they click the picture, we need to create the selection for them
        let target = event.target || event.srcElement || event.currentTarget;
        let coords = this.getRelativeCoords(event);

        // Set aside image coords
        this.imageCoords = coords;
        console.log(target);

        let range = Rangy.createRange();
        range.selectNodeContents(target['parentNode']);
        let sel = Rangy.getSelection();


        // Create placeholder spot
        this.imageHotspotPlaceholder = {
            index: target['parentNode']['parentNode'].getAttribute('index'),
            x: coords.x,
            y: coords.y,
            preview: true
        };
        // this makes sure there are no other selections made
        sel.setSingleRange(range);
        this.showCommentOptions(event);
    }

    /** Used to determine which level of permission the user has for a specific comment
     * @param comment A comment object
     */
    private getCommentPermissions(comment: any): number {
        if (this.user._id == comment.user_id) {
            return CommentPermissions.EDIT;
        } else if (this.user._id == this.project.teacher_id) {
            return CommentPermissions.DELETE;
        } else {
            return CommentPermissions.READ;
        }
    }

    /**
     * For image comments: Determines relative location of hotspot
     */
    private getRelativeCoords(e: Event): any {
        let target = e.target;
        let PosX = 0;
        let PosY = 0;
        let ImgPos;

         function FindPosition(oElement) {
            if(typeof( oElement.offsetParent ) != "undefined")
            {
                for(var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent)
                {
                posX += oElement.offsetLeft;
                posY += oElement.offsetTop;
                }
                return [ posX, posY ];
                }
                else
                {
                return [ oElement.x, oElement.y ];
                }
        }
        ImgPos = FindPosition(target);
        
        if (e['pageX'] || e['pageY'])
        {
            PosX = e['pageX'];
            PosY = e['pageY'];
        }
        else if (e['clientX'] || e['clientY'])
            {
            PosX = e['clientX'] + document.body.scrollLeft
                + document.documentElement.scrollLeft;
            PosY = e['clientY'] + document.body.scrollTop
                + document.documentElement.scrollTop;
            }
        return {
            x: ((PosX - ImgPos[0]) / target['clientWidth'] * 100).toFixed(3),
            y: ((PosY = (PosY - ImgPos[1])) / target['clientHeight'] * 100).toFixed(3)
        };
    }
}

