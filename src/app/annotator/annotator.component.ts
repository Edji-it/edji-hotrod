import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, QueryList, ViewChildren, HostListener, ViewChild } from '@angular/core'
import { Subject, Subscription } from 'rxjs/Rx';
import * as Rangy from 'rangy';
import { Angulartics2 } from 'angulartics2'
// import { HotkeysService, Hotkey } from 'angular2-hotkeys'

import { ReadingService } from '../shared/reading.service'
import { ProjectService } from '../shared/project.service'
import { CommentService } from '../shared/comment.service'
import { CommentComponent } from './comment/comment.component'
import { AudioService, AuthService, SocketService, UtilToolService } from '../shared' 
import { CommentPermissions, EdjiComment, Project, Reading } from './../shared/datatypes'

declare var window: any

@Component({
    selector: 'annotator',
    templateUrl: 'annotator.component.pug',
    styleUrls: ['annotator.component.scss']
})
export class AnnotatorComponent implements OnInit, OnDestroy {
    /*
        Annotator Component
        Last Mod: 5 Aug 2017 - Josh Kyburz
        
        This does all the heavy lifting in a a reading.
        - Loads Reading text
        - Compiles word components
        - Triggers highlighting
        - Deletes highlights and comment components
        - Asks ProjectService to save comments for us.
    */
    
    @Input() private mobileCommentActive: boolean
    @Input() private activeReply: any

    @ViewChildren(CommentComponent) commentComponents: QueryList<CommentComponent>
    @ViewChildren('words') wordEls
    @ViewChild('article') articleEl: ElementRef

    private reading: Reading = <Reading>{}
    private project: Project = <Project>{}
    // Determines when infinite scroll should begin 
    private lastWord: number = 4000
    private lastWordImageOffset: number = 100
    // Used to calculate max/progress for reading progress bar
    private currentDocHeight: number = 0
    private currentScroll: number = 0
    
    private commentsByIndex : EdjiComment[][] = []
    private focusOverride   : boolean = false

    private highlightArray      : number[] = []
    private alwaysHighlightArray: number[] = []
    private focusArray          : boolean[] = []
    
    // Line Count
    private lineCountRunning: boolean = false
    private lineNumRunning: boolean
    private commentPane: boolean
    private lineExpanded: number

    // private activeComment: EdjiComment = <EdjiComment>{}
    private replyComment: EdjiComment = <EdjiComment>{}
    private selectedComment: EdjiComment = <EdjiComment>{}
    // Comment options that can be made directly on a word
    private directCommentOptions: string[] = []

    // Trigger Booleans
    private showDiscussions : boolean = false
    private optionsShow = false
    private hideKeyboard = false

    // Status Booleans
    private isMobile = false

    private highlightY = 200 
    private highlightX = 20 
    private optionLeft = true
    private mobileIndex = 0

    private imageCoords = {}
    private imageHotspotPlaceholder: any = {
        index: -1,
        x: 0,
        y: 0,
        focus: false,
        preview: false
    }
    private imageHeight: number[] = []

    private subscriptions: Subscription[] = []

    // For converting old Readings
    private words: any[] = []

    // For verifying comment ownership
    private user: any

    // For mobile display of comments
    private foundArray: any[] = []

    private guideContent = [
        {
            title: "Try Highlighting!",
            image: "/assets/guide/add-highlight.gif",
            body: "Highlight text or click on an image to see the comment types."
        },
        {
            title: "Add a Comment!",
            image: "/assets/guide/add-comment-type.gif",
            body: "Choose to leave a Text or Emoji comment."
        },
        {
            title: "Who sees my comment?",
            // image: "/assets/guide/add-comment-type.gif",
            body: "Your comment can be seen by the reading creator. If they turn Heat Vision on, everyone can see it!"
        }
    ]
    private guideStepNo = 1

    private annotatorPaper: Element
    private annotatorContent: Element

    private window: any
    private audioSupportError: boolean = false

    constructor(
        private element: ElementRef,
        private _readings: ReadingService,
        private _projects: ProjectService,
        private _auth: AuthService,
        private _socket: SocketService,
        private _util: UtilToolService,
        private _comments: CommentService,
        private angulartics: Angulartics2,
        private _audio: AudioService
        // private _hotkeysService: HotkeysService
    ) {
        // this._hotkeysService.add(new Hotkey('t', (event: KeyboardEvent): boolean => {
        //      this.addTextComment({ name: 'Hotkey'})
        //     return false // Prevent bubbling
        // }))
        // this._hotkeysService.add(new Hotkey('e', (event: KeyboardEvent): boolean => {
        //      this.addEmojiComment({ name: 'Hotkey'})
        //     return false // Prevent bubbling
        // }))
        this.window = window
    }

    /**
     * This renders the next 400 words whenever the window gets a certain amount away from the bottom of the view,
     *  which is determined by distanceFromViewport
     */
    @HostListener('window:scroll', ['$event'])
    scrollUpdate(event) {
        this.onScrollUpdate()
        this.currentScroll = (document.documentElement.scrollTop / ( document.body.scrollHeight - window.innerHeight ) ) * 100
    }
    
    ngOnInit() {
        // Make sure we broadcast lastWord position out to listening components
        this._projects.lastWordUpdateSubj.next(this.lastWord)

        this.annotatorPaper = document.getElementById('emojiAnnotator')
        this.annotatorContent = document.getElementById('annotatorContent')
        
        this.subscriptions
            .push(
                // Set the current user every time it changes 
                this._auth.getCurrentUser().subscribe((user) => {
                    this.user = user
                }), 
                // Get Reading via Observable
                this._readings.currentReading.subscribe(
                    reading => {
                        this.reading = reading
                        if (this.reading && this.reading.words && this.reading.words[0]===null) {
                            this.reading.words.splice(0,1)
                        }
                        this.updateMetaTags()
                        if (reading.questions) {
                            this.updateQuestionNumbers(reading.questions)
                        }
                    },
                    error => {
                        console.error(error)
                    }
                ),
                // Get Project from project service
                this._projects.currentProject.subscribe(
                    (project) => {
                        if (project) {
                            this.project = project
                            this.setLinePositions()
                            // Check if audio is supported
                            if (this.project.types.indexOf('audio') > -1 && !this._audio.isSupported()) {
                                this.audioSupportError = true
                                // if audio is not supported, let analytics know
                                this.angulartics.eventTrack.next({ action: 'audioSupport', properties: { category: 'heroFeature', label: 'failure' }})
                            }
                            this.directCommentOptions = []
                            for (let i = 0; i < this.project.types.length; i++) {
                                // Ignore comment types that can't be made on a word
                                // - add other types not display in text-options to the array below
                                if (['reply'].indexOf(this.project.types[i]) < 0) {
                                    this.directCommentOptions.push(this.project.types[i])
                                }
                            }
                        }
                    },
                    (error) => {
                        console.error(error)
                    })
            )
        /** Run-once logic to initialize the comment-based arrays and stats */
        let processedCommentData = this._projects.processComments(this.project)
        this.commentsByIndex = processedCommentData.commentsByIndex
        this.alwaysHighlightArray = processedCommentData.highlightArrays.alwaysHighlightArray
        this.highlightArray = processedCommentData.highlightArrays.highlightArray

        // Subscribe to comment comment updates
        this.subscriptions.push(
            this._socket.commentUpdates.subscribe((commentUpdate) => {
                let comment = commentUpdate.comment
                let wIndex = comment.start
                let cIndex = -1

                // Get local array index
                if (this.commentsByIndex[wIndex]) {
                    // faster to cache length
                    let commentsByIndexLength = this.commentsByIndex[wIndex].length
                    for (var i = 0; i < commentsByIndexLength; i++) {
                        let commentRef = this.commentsByIndex[wIndex][i]
                        if (commentRef._id === comment._id) {
                            cIndex = i
                        }
                    }
                }
                
                // Process different live comment updates
                if (commentUpdate.action === 'DELETE') {
                    if (cIndex > -1) {
                        // Remove highlights from local array
                        this.decrementHighlights(this.user._id === comment.user_id || this.project.teacher_id == comment.user_id, comment.start, comment.end)
                        // Make sure we've removed the highlight focus
                        this.unfocusHighlight(comment.start, comment.end)
                        this.commentsByIndexRemove(wIndex, cIndex, comment._id)
                    }
                } else if (commentUpdate.action === 'UPDATE') {
                    if (cIndex > -1 && this.commentsByIndex[wIndex] && this.commentsByIndex[wIndex][cIndex]) {
                        this.commentsByIndexUpdate(comment, wIndex, cIndex)
                    } else {
                        // Socket updates don't come through with a timestamp
                        comment.createdAt = Date.now()
                        // Sometimes an UPDATE comes through for comment not yet created
                        // Add highlights to local array
                        this.incrementHighlights(this.user._id === comment.user_id || this.project.teacher_id == comment.user_id, comment.start, comment.end)
                        this.commentsByIndexAdd(comment, wIndex, true)
                    }
                } else if (commentUpdate.action === 'CREATE') {
                    // Socket updates don't come through with a timestamp
                    comment.createdAt = Date.now()
                    // Add highlights to local array
                    this.incrementHighlights(this.user._id === comment.user_id || this.project.teacher_id == comment.user_id, comment.start, comment.end)
                    this.commentsByIndexAdd(comment, wIndex, true)
                }
            }, (error) => {
                console.warn(error)
            })
        )

        // Subscribe to Heat Vision toggle updates
        this.subscriptions.push(
            this._socket.heatVisionUpdates.subscribe((heatToggle) => {
                this.project.heat_vision = heatToggle.heatVision.all
                this.setLinePositions()
            })
        )

        // Subscribe to updates on where to move the lastWord for the infinity scroll
        this.subscriptions.push(
            this._projects.lastWordUpdateState.subscribe(
                (lastWord) => {
                    this.lastWord = lastWord + this.lastWordImageOffset
                }
            )
        )

        // After comments are added to the array
        // this.updateAllLineCounts()
        this.updateImageHeights()

        // Hacky McHackFace since images render later, and need to be rendered to determine comment position
        setTimeout(() => {
            this.setLinePositions()
        }, 3000)
       
        // Line counts need to be re-rendered when text reflows
        window.onresize = () => {
            this.updateImageHeights()
            this.setLinePositions()
            // Update scroll progress on resize
            this.currentDocHeight = 0
            this.preScrollHeightUpdate()
        }

        // Only supported by modern browsers, but very reliable in those cases
        document.addEventListener("selectionchange", (event) => {
            if(!this.optionsShow) {
                this.showCommentOptions({ name: 'selectionchange', target: document })
            }
        })
    } // ngOnInit

    ngOnDestroy() {
        this._readings.clear()
        this.subscriptions.forEach((sub) => { sub.unsubscribe() })
    }
    
    /**
     * Updates the rendered words as the user scrolls through the reading
     */
    private onScrollUpdate() : void {
        let bottomOfArticle = this.articleEl.nativeElement.offsetTop + this.articleEl.nativeElement.clientHeight
        let bottomOfView = window.innerHeight + document.scrollingElement.scrollTop
        let distanceFromViewport = 500
        if (bottomOfArticle - distanceFromViewport < bottomOfView) {
            this.lastWord += 800
            // Make sure we broadcast lastWord position out to listening components
            this._projects.lastWordUpdateSubj.next(this.lastWord)
            // Re-run the line positions so comment avatars show up in the right spot
            this.setLinePositions()
        }
    }

    /**
     * Sets the minimum height of the document for better current scroll position rendering
     */
    private preScrollHeightUpdate(): void {
        let body = document.body
        let html = document.documentElement
        // Find the maximum document height
        let height = Math.max( 
            body.scrollHeight, 
            body.offsetHeight, 
            html.clientHeight, 
            html.scrollHeight, 
            html.offsetHeight 
        )
        // Extrapolate a value for document height based on total words and words already rednered with the current height
        this.currentDocHeight = (height*this.reading.words.length)/this.lastWord
    }

    // Updates OGP
    private updateMetaTags() : void {
        document.querySelector('meta[property="og:title"]').setAttribute('content', this.reading.title)
        // let blurb: string
        // blurb += '...'
        // document.querySelector('meta[property="og:description"]').setAttribute('content', blurb)
        // let firstImage = document.querySelector('.img-wrap img')
        // if (firstImage) {
        //     document.querySelector('meta[property="og:image"]').setAttribute('content', firstImage.getAttribute('src'))
        // }
    }

    // Adds the question number to each question for proper rendering
    private updateQuestionNumbers(questions) {
        for (let i=0;i<questions.length;i++) {
            questions[i].question_number = i+1
        }
    }

    hideCommentOptions(event ?): void {
        this.optionsShow = false
        this.imageHotspotPlaceholder['preview'] = false
    }

    /**
     * Show tooltip to the side with buttons for adding comment types
     */
    showCommentOptions(event, doNotDismiss ?: boolean): void {
        // Only show options if text selected
        let sel = Rangy.getSelection()
        let target = event.target || event.srcElement || event.currentTarget
        // let targetTag = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : ''
        
        /**
         * Handle creating selection and coordinates for comments on images
         */
        if (target.classList && target.classList.contains('reading-image') && target['parentNode']) {
            // when they click the picture, we need to create the selection for them
            this.imageCoords = this.getRelativeCoords(event)
            
            let range = Rangy.createRange()
            range.selectNodeContents(target['parentNode'])

            // Create placeholder spot
            this.imageHotspotPlaceholder = {
                index: target.getAttribute('index'),
                x: this.imageCoords['x'],
                y: this.imageCoords['y'],
                preview: true
            }
            
            // this makes sure there are no other selections made
            sel.setSingleRange(range)
        } else {
            // Functions as "click outside" for images
            if (event.name != 'timeout') {
                this.hideCommentOptions()
            }
        }
        
        // Make sure selection exists, and is within highlightable content
        if (sel && (this.imageHotspotPlaceholder.preview || sel.toString())
                && (sel.focusNode.classList && sel.focusNode.classList.contains('w') || (sel.focusNode.parentNode.classList.contains('w') || sel.focusNode.parentNode.classList.contains('img-wrap')))
                && (sel.anchorNode.classList && sel.anchorNode.classList.contains('w') || (sel.anchorNode.parentNode.classList.contains('w') || sel.anchorNode.parentNode.classList.contains('img-wrap')))
            ) {
            let scrollOffset = this.annotatorPaper.getBoundingClientRect().top
            const readingPad = 52
            let focusY
            if (!!sel.focusNode.getBoundingClientRect) {
                focusY = sel.focusNode.getBoundingClientRect().top
            } else {
                focusY = sel.focusNode.parentNode && sel.focusNode.parentNode.getBoundingClientRect().top
            }

            // Set y position of comment options
            this.highlightY = (focusY - scrollOffset + readingPad)
            
            if (this.imageHotspotPlaceholder.preview == true) {
                let yOnImage = this.imageHeight[this.imageHotspotPlaceholder.index]
                // Offset 10px to line up with hotspot
                this.highlightY = this.highlightY + (this.imageHotspotPlaceholder.y/100 * yOnImage) - 10
            } 
            this.optionsShow = true
            // Guide content
            if (this.guideStepNo < 2) {
                this.guideStepNo = 2
            }
        } else if (!doNotDismiss) {
            this.optionsShow = false
            this.imageHotspotPlaceholder.preview = false
        }
    }

    isCommentVisible(comment: any) : boolean {
        // If current user is Owner/Teacher or heat vision is on
        let heatVisible = this.project.heat_vision || this.user._id == this.project.teacher_id
        // Otherwise visible if Owner/Teacher comment or current user's comment
        let alwaysVisible = comment.user_id == this.user._id || comment.user_id == this.project.teacher_id
        return heatVisible || alwaysVisible
    }

    updateImageHeights(): void {
        let images: any[] = Array.from(document.querySelectorAll('#annotatorContent .img-wrap img'))
        for (let i = 0; i < images.length; i++) {
            this.imageHeight[ images[i].getAttribute('index') ] = images[i].clientHeight
        }
    }

    /** 
     * Fired by Output from the Comment Component
     * - References _projects.commentByPos
     */
    expandLine(lineY: number, forceSet ?: boolean) {
        let commentsByPos = this._projects.commentByPosSource
        // If collapsing a line, make sure to deactivate all comments
        if (forceSet === false) {
            this._comments.deactivateAllComments()
            this.lineExpanded = 0
        }
        if (commentsByPos[lineY]) {
            // Keep track of which line is expanded
            if (forceSet === true) {
                this.lineExpanded = lineY
            }
            // Loop through comments on line and mark comments as expand
            for (let i = 0; i < commentsByPos[lineY].length; i++) {
                let comment = commentsByPos[lineY][i]
                if (typeof(forceSet) !== 'undefined') {
                    comment.expanded = forceSet
                } else {
                    comment.expanded = !comment.expanded
                }
            }
        }
    }

    /**
     * Add new highlights to local array
     */
    incrementHighlights(alwaysHighlight: boolean, start: number, end: number): void {
        if (alwaysHighlight) {
            for (var i = start; i <= end; i ++) {
                if (this.alwaysHighlightArray[i]) {
                    this.alwaysHighlightArray[i]++
                } else {
                    this.alwaysHighlightArray[i] = 1
                }
            }
        } else {
            for (var i = start; i <= end; i ++) {
                if (this.highlightArray[i]) {
                    this.highlightArray[i]++
                } else {
                    this.highlightArray[i] = 1
                }
            }
        }
    }

    /**
     * Removes highlights from local array
     */
    decrementHighlights(alwaysHighlight: boolean, start: number, end: number): void {
        setTimeout(()=>{
            if (alwaysHighlight) {
                for (var i = start; i <= end; i ++) {
                    if (this.alwaysHighlightArray[i] && this.alwaysHighlightArray[i] > 0) {
                        this.alwaysHighlightArray[i]--
                    } else {
                        this.alwaysHighlightArray[i] = 0
                    }
                }
            } else {
                for (var i = start; i <= end; i ++) {
                    if (this.highlightArray[i] && this.highlightArray[i] > 0) {
                        this.highlightArray[i]--
                    } else {
                        this.highlightArray[i] = 0
                    }
                }
            }
        }, 1)
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
        this.inactivateComment()

        // STEP: We're prepping a comment to send to ProjectService for saving.

        let text: string = ''
        for (var i = start; i <= end; i++) {
            text += this.reading.words[i] ? this.reading.words[i].str : ' '
        }

        this.angulartics.eventTrack.next({ action: type + 'CommentCreate', properties: { category: 'projectAction', label: 'attempt' }})
        
        let comment = <EdjiComment>{
            data: '',
            start: start,
            end: end,
            type: type,
            text: text,
            loc: this.imageCoords,
            author: this.user.fullname,
            user_id: this.user._id,
            createdAt: new Date(),
        }

        this.commentsByIndexAdd(comment, start)

        // // Tell server we've added a comment
        // this._projects.saveComment(comment)
        //     .then(comment => {
        //         // We add the comment from the service because it has an Id
        //         if (comment._id) {
        //             this.angulartics.eventTrack.next({ action: type + 'CommentCreate', properties: { category: 'projectAction', label: 'success' }})
        //             // Add setting to trigger focus on new comment
        //             comment.new = true // this is basically to tell our test cases which comment was just made
        //             this.inactivateComment()
        //             this.commentsByIndexAdd(comment, start)
        //         } else {
        //             console.warn('Didn\'t get a comment back from server!')
        //         }

        //         // Guide content
        //         if (this.guideStepNo < 3) {
        //             this.guideStepNo = 3
        //         }
        //     })
        //     .catch(error => {
        //         // TRACK EXCEPTION
        //         this.angulartics.eventTrack.next({ action: type + 'CommentCreate', properties: { category: 'projectAction', label: 'failure' }})
        //         // We should figure out how to handle this properly!
        //         // Maybe show a warning icon?
        //         console.warn(error)
        //     })
    } // createComment

    commentsByIndexUpdate(comment, wordIndex: number, commentIndex: number) {
        this.commentsByIndex[wordIndex][commentIndex].data = comment.data
    }

    commentsByIndexAdd(comment, index: number, addQuietly ?: boolean): void {
        let start = comment.start

        // Add comment to local project array
        this.project.comments.unshift(comment)
        let commentPointer = this.project.comments[0]
        
        // Add Comment to local array
        if (this.commentsByIndex[start]) {
            this.commentsByIndex[start].push(commentPointer)
            if (addQuietly !== true) { 
                this.setActiveCommentByIndex(true, start, this.commentsByIndex[start].length - 1)
            }
        } else {
            this.commentsByIndex[start] = [ commentPointer ]
            if (addQuietly !== true) { 
                this.setActiveCommentByIndex(true, start, 0)
            }
        }
        // this.updateAllLineCounts()
        this.setLinePositions()
        this._projects.commentStats.addCommentToStats(commentPointer, 1)
    }

    /**
     * Removes comment from locally transformed array (commentsByIndex)
     */
    commentsByIndexRemove(index: number, commentIndex: number, commentId?) {
        let comment = this.commentsByIndex[index][commentIndex]
        let commentPointer
        let commentCopy
        // Find comment in local Comments array
        let commentsLength: number = this.project.comments.length
        // Some comments are removed from this array by the Project service, so don't expect to find one
        for (let i=0; i < commentsLength; i++) {
            if (this.project.comments[i]._id == commentId) {
                commentPointer = this.project.comments[i]
                commentCopy = Object.assign({}, commentPointer)
                this.project.comments.splice(i, 1)
                break
            }
        }
        // Project service handles stats updates as well, but we need to handle socket updates
        if (commentCopy) {
            this._projects.commentStats.addCommentToStats(commentCopy, -1)
        }
        // Remove from index reference object
        for (let i=0; i < this.commentsByIndex[index].length; i++) {
            if (this.commentsByIndex[index][i]._id == commentId) {
                this.commentsByIndex[index].splice(i, 1)
                break
            }
        }
        // Update line counts
        this.setLinePositions()
    }

     /**
     * Fires after the comment has been deleted in the database
     * - Removes comment from locally transformed array (commentsByIndex)
     * - De-increments the highlights
     */
    removeComment(comment, index: number, commentIndex: number) {
        // Remove Highlights
        this.decrementHighlights(this.user._id === comment.user_id, comment.start, comment.end)
        // Remove local comment object
        this.commentsByIndexRemove(index, commentIndex, comment._id)
        this.unfocusHighlight(comment.start, comment.end)
    }

    setActiveCommentByIndex(isActive: boolean, wordIndex: number, commentIndex: number, comment?: EdjiComment): void {
        // Any currrently active comments need to be deactivated
        this.inactivateComment()
        if (isActive) {
            if (typeof(comment) !== 'undefined') {
                this._comments.activeComment = comment
                this._comments.activeComment.active = true
            } else {
                this._comments.activeComment = this.commentsByIndex[wordIndex][commentIndex]
                this._comments.activeComment.active = true
            }
        }
    }

    inactivateComment():void {
        this.unfocusHighlight(this._comments.activeComment.start, this._comments.activeComment.end)
        this._comments.activeComment.active = false
        this._comments.activeComment = <EdjiComment>{}
    }

    /**
     * Receive comment data from input sources:
     * - Gets event from Emoji Keyboard
     */
    updateActiveComment(commentData: string) {
        this._comments.activeComment.data = commentData
    }

    /** 
     * Returns Start and End word indices of text selection
     */
    getSelectionSpan(): any {
        let selection = Rangy.getSelection()
        let start : number
        let end : number
        let comment: any
        
        let getNodeIndex = function(node: any) : number {

            // Selections often happen at the text node level, inside the actual element
            // In which case we need to reference its parent node
            // Note: we tried node.hasOwnProperty here and would sometimes get a false true resolution of the if statement... not sure how that is possible
            if(!!node.className && node.className == 'w') {
                return parseInt(node.getAttribute('index'))
            } else {
                return parseInt(node.parentNode.getAttribute('index'))
            }
        }

        if (selection['anchorNode'] && selection['focusNode']) {
            start = getNodeIndex(selection['anchorNode'])
            end = getNodeIndex(selection['focusNode'])
            
            // It's possible that a selection is made backwards
            // We want the start index to come first
            if (start > end) {
                end = [start, start = end][0] // Swap start and end values
            }
            // Hide tool tips
            this.hideCommentOptions()
            // Clear selections
            selection.removeAllRanges()
        }

        // Fix for commenting on images in Safari
        if (!start && start != 0) {
            start = end
        }
        if (!end && end != 0) {
            end = start
        }
        
        return { 'start': start, 'end': end }
    }

    /** 
     * Add Comment of type
     * - Fired from comment options tooltip
    */
    addCommentOfType(type: string): void {
        // Get selection indices
        let span = this.getSelectionSpan()
        if ( !(span.start >= 0) || !(span.end >= 0)) {
            return
        }
        
        // Increment highlight array
        this.incrementHighlights(true, span.start, span.end)

        // Tell the server we've got a comment!
        this.createComment(span.start, span.end, type)
    }

    /**
     * Loops through child elements to find textnodes
     * Pushes text nodes as formatted objects into this.words
     * @param element Root element to start crawling from
     */
    private extractTextNodes(element: any, ancestorTags ?: string[]) {
        let tagName = element.tagName.toLowerCase()
        let nodes = element.childNodes
        
        // Children should inherit tags from several elements up
        // eg. "B" style should propagate down
        if (!ancestorTags) {
            ancestorTags = []
        } 

        if (ancestorTags.indexOf(tagName) < 0) {
            ancestorTags.push(tagName)
        }

        for (let index = 0; index < nodes.length; index++) {

            let node = nodes[index]
            // Copy tags array to variable local to loop instance
            let inheritedTags = ancestorTags.slice()

            if (node.nodeType === 3) {
                // Found a text node!

                // Split text inside child nodes
                let nodeWords = node.textContent.split(/(?:([^a-zA-Z0-9]))/).filter(function(el){ return el.replace(/([\n])/g, '') } )  
                
                // If empty element, push a spacer word to reflect that
                if (nodeWords.length < 1) {
                    this.words.push({
                        str: '',
                        styles: ['space', 'space-first', 'space-last'].concat(inheritedTags)
                    })
                }

                // Otherwise loop through words, and process into array
                for (let wIndex = 0; wIndex < nodes.length; wIndex++) {
                   let nodeWord = nodeWords[wIndex]
                   let word = {
                        str : nodeWord,
                        styles: [].concat(inheritedTags)
                    }
                    let addBr = false
                    if (word.str && word.str.trim().length < 1) {
                        word.styles.push('space')
                    }
                    if (index == 0 && wIndex == 0) {
                        word.styles.push(tagName + '-first')
                    }
                    if (index == nodes.length - 1 && wIndex == nodeWords.length - 1) {
                        word.styles.push(tagName + '-last')
                        addBr = true
                    }
                    this.words.push(word)
                    if (addBr) {
                        // Add break element
                        this.words.push({
                            str: '',
                            styles: ['br']
                        })
                    }
                }
            } else {
                // If not a text node, dig deeper for text nodes
                this.extractTextNodes(node, inheritedTags)
            }
        }
    }

    /**
     * Adds focus text highlighted for the relevant comment
     * @param start Index for first word
     * @param end Index for last word
     */
    private focusHighlight(start, end, location ?: any): void {
        if (this.optionsShow == true) {
            return
        }
        for (var i = start; i <= end; i ++) {
            // if (this.focusArray[i]) {
                this.focusArray[i] = true
            // } else {
            //     this.focusArray[i] = false
            // }
        }
        if (location && location.x && location.y) {
            this.imageHotspotPlaceholder = {
                index: start,
                x: location.x,
                y: location.y,
                focus: true
            }
        }
    }

    /**
     * Removes a class to focus text highlighted for the relevant comment
     * @param start Index for first word
     * @param end Index for last word
     */
    private unfocusHighlight(start, end, location ?: any): void {
        if (!this.focusOverride) {
            for (var i = start; i <= end; i ++) {
                // if (this.focusArray[i] = true) {
                    this.focusArray[i] = false
                // } 
            }
            this.imageHotspotPlaceholder['focus'] = false
        }
    }

    /**
     * Keep this light! It runs for every word instance
     * @param i is the word index
     */
    private getHighlightClass(i: number): string {
        let classString = ''
        let highlightCount = 0
        let focusHighlight = false

        if ((this.project.heat_vision || this.user._id == this.project.teacher_id) && this.highlightArray[i]) {
            highlightCount += this.highlightArray[i]
        }
        if (this.alwaysHighlightArray[i]) {
            // AlwaysHighlight also tracks focused words
            // if (this.alwaysHighlightArray[i] >= 1000) {
            //     // Focus style
            //     focusHighlight = true
            //     highlightCount += (this.alwaysHighlightArray[i] - 1000)
            // } else {
                highlightCount += this.alwaysHighlightArray[i]
            // }
        }
        if (this.focusArray[i]) {
            classString = 'h-f'
        }
        return classString + ' h-' + highlightCount
    }

    // private imageCommentOptions(imageIndex: number, event: Event) : void {
        
    //     this.showCommentOptions(event)
    // }

    /** Used to determine which level of permission the user has for a specific comment
     * @param comment A comment object
     */
    private getCommentPermissions(comment: any): number {
        return this._comments.getCommentPermissions(comment, this.user, this.project)
    }

    /**
     * For image comments: Determines relative location of hotspot
     */
    private getRelativeCoords(e: Event): any {
        let target = e.target
        let PosX = 0
        let PosY = 0
        let ImgPos

         function FindPosition(oElement) {
            if(typeof( oElement.offsetParent ) != "undefined")
            {
                for(var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent)
                {
                posX += oElement.offsetLeft
                posY += oElement.offsetTop
                }
                return [ posX, posY ]
                }
                else
                {
                return [ oElement.x, oElement.y ]
                }
        }
        ImgPos = FindPosition(target)
        
        if (e['pageX'] || e['pageY'])
        {
            PosX = e['pageX']
            PosY = e['pageY']
        }
        else if (e['clientX'] || e['clientY'])
            {
            PosX = e['clientX'] + document.body.scrollLeft
                + document.documentElement.scrollLeft
            PosY = e['clientY'] + document.body.scrollTop
                + document.documentElement.scrollTop
            }
        return {
            x: ((PosX - ImgPos[0]) / target['clientWidth'] * 100).toFixed(3),
            y: ((PosY = (PosY - ImgPos[1])) / target['clientHeight'] * 100).toFixed(3)
        }
    }

    /**
     * Decides if the Emoji Keyboard is active
     */
    private isEmojiKeyboardActive() : boolean {
        // return this._comments.isEmojiKeyboardActive(this.user)
        return this._comments.setEmojiKeyboardActive(this.user)
    }

    private discReplyFire(comment) {
        this.replyComment = comment
        this.focusOverride = true
        this.focusHighlight(comment.start, comment.end, comment.loc)
        this.angulartics.eventTrack.next({ action: 'openDiscussionPanel', properties: { category: 'heroFeature', label: 'success' }})
        this.showDiscussions = true
    }

    private hideDiscussions(comment: any) {
        this.showDiscussions = false
        this.focusOverride = false
        this.unfocusHighlight(comment.start, comment.end, comment.loc)
    }
    
    /**
     * setLinePositions gives us the number of lines in the project
     * 
     * If the height of the word element does not match the one before it, this counts as a new line
     * We check this every time the comment pane is open in case the user adjusts screen width
     */
    setLinePositions(): void {
        if (typeof(this.commentComponents) == 'undefined') {
            setTimeout(()=>{
                this.setLinePositions()
            }, 500)
            return
        }
        // We need majority of content loaded before checking the height
        if (this.currentDocHeight==0) {
            this.preScrollHeightUpdate()
        }
        // Let's do this!
        let allComments = this.commentComponents.toArray()
        // Only run this if the words are rendered and if it isn't already running
        if (!this.lineNumRunning && allComments.length > 0) {
            this.lineNumRunning = true
            
            // Loop through each word element and tell comments to update line number
            let len: number = allComments.length
            for (let i = 0; i < len; i++) {
                let commentComp = allComments[i]
                // Tell comments to update lineY value
                commentComp.setLineY()
            }
            // Set up comments by line for Comment Pane
            this._projects.buildCommentsByPos()
            // Done!
            this.lineNumRunning = false
        }
    }

    private toggleCommentPane(visible?: boolean, comment?): void {
        // Make sure the line counts are up-to-date
        this.setLinePositions()

        // Set the input comment to the comment pane if it is not currently open
        if (visible) {
            this.selectedComment=comment
        }
        // Toggle the variable that controls comment pane open/close so we can add a class to "push" screen over
        if (visible) {
            // Tell pane to open
            this.commentPane = true
            this._projects.commentPaneStateSubj.next(true)
        } else {
            setTimeout(()=>{
                // Tell comments to close
                this.commentPane = false
                this._projects.commentPaneStateSubj.next(false)
                // Run the standard comment inactivation to reset variables and do things like close the Keyboard
                this.inactivateComment()
            }, 1)
        }
    }
}