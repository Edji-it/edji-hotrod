/**
 *  Annotator Component
 *  - Loads Reading text
 *  - Compiles word components
 *  - Triggers highlighting
 *  - Deletes highlights and comment components
 */
import { Component, Input, OnDestroy, OnInit, ViewChildren, QueryList, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs/Rx'
import * as Rangy from 'rangy'
import { Angulartics2 } from 'angulartics2'
// import { HotkeysService, Hotkey } from 'angular2-hotkeys'

import { ReadingService } from '../shared/reading.service'
import { ProjectService } from '../shared/project.service'
import { CommentService } from '../shared/comment.service'
import { CommentComponent } from './comment/comment.component'
import { AuthService } from '../shared/auth.service' 
import { SocketService } from '../shared/socket.service'
import { CommentPermissions, EdjiComment, Project, Reading } from './../shared/datatypes'

declare var window: any

@Component({
    selector: 'annotator',
    templateUrl: 'annotator.component.html',
    styleUrls: ['annotator.component.scss']
})
export class AnnotatorComponent implements OnInit, OnDestroy {
    // @Input() private project: any
    @Input() private mobileCommentActive: boolean
    @Input() private activeReply: any

    @ViewChildren(CommentComponent) commentComponents: QueryList<CommentComponent>

    private reading: Reading = <Reading>{}
    private project: Project = <Project>{}
    
    private commentsByIndex: EdjiComment[][] = []
    private fireComments: EdjiComment[] = []
    private showDiscussions = false

    private highlightArray: number[] = []
    private alwaysHighlightArray: number[] = []
    private focusArray: boolean[] = []
    
    // An array of arrays!
    private lineCountArray: any[][] = []
    private lineCountRunning: boolean = false

    // private activeComment: EdjiComment = <EdjiComment>{}
    private replyComment: EdjiComment = <EdjiComment>{}
    
    private lineExpanded: boolean = false
    private showCommentCounts: boolean = false
    private showAllComments: boolean = false

    private highlightY = 200 
    private highlightX = 20 
    private optionLeft = true
    private isMobile = false
    private optionsShow = false
    private mobileIndex = 0
    private hideKeyboard = false

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
        private _readings: ReadingService,
        private _projects: ProjectService,
        private _auth: AuthService,
        private _socket: SocketService,
        private _comments: CommentService,
        private angulartics: Angulartics2
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
    
    ngOnInit() {
        this.annotatorPaper = document.getElementById('emojiAnnotator')
        this.annotatorContent = document.getElementById('annotatorContent')

        /** Set the current user every time it changes */
        this.subscriptions.push(
            this._auth.getCurrentUser().subscribe((user) => {
                this.user = user
            })
        )

        // Get Reading via Observable
        this.subscriptions.push(
            this._readings.currentReading.subscribe(
                reading => {
                    this.reading = reading
                    this.updateMetaTags()
                },
                error => {
                    console.error(error)
                }
            )
        )

        // Get Project via Observable
        this.subscriptions.push( this._projects.currentProject.subscribe(
            (project) => {
                if (project) {
                    this.project = project
                    // Check if audio is supported
                    if (this.project.types.indexOf('audio') > -1 && !navigator.getUserMedia) {
                        this.audioSupportError = true
                        // if audio is not supported, let analytics know
                        this.angulartics.eventTrack.next({ action: 'audioSupport', properties: { category: 'heroFeature', label: 'failure' }})
                    }
                }
            },
            (error) => {
                console.error(error)
            }
        ) )

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
                        this.commentsByIndexRemove(comment._id, wIndex, cIndex)
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
                this.updateAllLineCounts()
            })
        )

        // After comments are added to the array
        this.updateAllLineCounts()
        this.updateImageHeights()

        // Hacky McHackFace since comments render later (especially lots of comments)
        for (var i = 0; i <= 3; i++) {
             setTimeout(() => {
                this.updateAllLineCounts()
             }, ( 1000*i - 1000) )
        }
       
        // Line counts need to be re-rendered when text reflows
        window.onresize = () => {
            this.updateAllLineCounts()
            this.updateImageHeights()
        }

        // Fallback for tooltip: Continuous text selection check
        this.loopCheckTextSelection()
    }

    ngOnDestroy() {
        this._readings.clear()
        this.subscriptions.forEach((sub) => { sub.unsubscribe() })
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
                && Rangy.dom.isAncestorOf(this.annotatorContent, sel.focusNode)
                && Rangy.dom.isAncestorOf(this.annotatorContent, sel.anchorNode)
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

    loopCheckTextSelection(): void {
        setTimeout(() => {
            this.showCommentOptions({ name: 'timeout', target: document })
            this.loopCheckTextSelection()
        }, 500)
    }

    updateAllLineCounts(): void {
        if (!this.lineCountRunning) {
            this.lineCountArray = []
            this.lineCountRunning = true
            if (this.commentComponents) {
                let commentsArray = this.commentComponents.toArray()
                for (let i = 0; i < commentsArray.length; i++) {
                    let commentComp = commentsArray[i]
                    let yPos = commentComp.getVerticalPosition()
                    
                    if (yPos > 0) { // 0 is returned as the default
                        if (this.lineCountArray[yPos]) {
                            this.lineCountArray[yPos].push(commentComp)
                        } else {
                            this.lineCountArray[yPos] = [commentComp]
                        }
                        commentComp.lineCount = this.lineCountArray[yPos].length
                    }
                }
            } 

            // Sometimes comments render late
            setTimeout(() => {
                this.updateAllLineCounts()
            }, 2000)
            this.lineCountRunning = false
        }
    }

    updateImageHeights(): void {
        let images: any[] = Array.from(document.querySelectorAll('#annotatorContent .img-wrap img'))
        for (let i = 0; i < images.length; i++) {
            this.imageHeight[ images[i].getAttribute('index') ] = images[i].clientHeight
        }
    }

    /** 
     * Fired by Output from the Comment Component
     * - References lineCountArray
     */
    expandLine(yPosToExpand: number, forceSet ?: boolean) {
        if (this.lineCountArray[yPosToExpand]) {
            this.lineCountArray[yPosToExpand]
            for (let i = 0; i < this.lineCountArray[yPosToExpand].length; i++) {
                let comment = this.lineCountArray[yPosToExpand][i]
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
        if (alwaysHighlight) {
            for (var i = start; i <= end; i ++) {
                // Any time we decrement, we should ensure we remove the 1000 focus
                if (this.alwaysHighlightArray[i] >= 1000) {
                    this.alwaysHighlightArray[i] -= 1000
                }

                if (this.alwaysHighlightArray[i] && this.alwaysHighlightArray[i] > 0) {
                    this.alwaysHighlightArray[i]--
                } else {
                    this.alwaysHighlightArray[i] = 0
                }
            }
        } else {
            for (var i = start; i <= end; i ++) {
                // Any time we decrement, we should ensure we remove the 1000 focus
                if (this.highlightArray[i] >= 1000) {
                    this.highlightArray[i] -= 1000
                }

                if (this.highlightArray[i] && this.highlightArray[i] > 0) {
                    this.highlightArray[i]--
                } else {
                    this.highlightArray[i] = 0
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
        this.inactivateComment()

        let projectId = this.project._id
        let text: string = ''
        for (var i = start; i <= end; i++) {
            text += this.reading.words[i].str
        }

        this.angulartics.eventTrack.next({ action: type + 'CommentCreate', properties: { category: 'projectAction', label: 'attempt' }})
        
        let comment = <EdjiComment>{
            project_id: projectId,
            data: '',
            start: start,
            end: end,
            type: type,
            loc: this.imageCoords
        }

        // Tell server we've added a comment
        this._projects.saveComment(comment)
            .then(comment => {
                // We add the comment from the service because it has an Id
                if (comment._id) {
                    this.angulartics.eventTrack.next({ action: type + 'CommentCreate', properties: { category: 'projectAction', label: 'attempt' }})
                    // Check if comment should start expanded
                    // Needs to be moved to commentsByIndexAdd or comment component ngOnInit
                    // if (document.querySelector('.w[index="' + start + '"] .comment')) {
                    //     let commentY = document.querySelector('.w[index="' + start + '"] .comment')['offsetTop']

                    //     if (this.lineCountArray[commentY] && this.lineCountArray[commentY][0].expanded) {
                    //         comment.expanded = true
                    //         comment.lineCount = this.lineCountArray[commentY].length + 1
                    //     }
                    // }
                    // Add setting to trigger focus on new comment
                    comment.new = true // this is basically to tell our test cases which comment was just made
                    this.inactivateComment()
                    this.commentsByIndexAdd(comment, start)
                } else {
                    console.warn('Didn\'t get a comment back from server!')
                }

                // Guide content
                if (this.guideStepNo < 3) {
                    this.guideStepNo = 3
                }
            })
            .catch(error => {
                // TRACK EXCEPTION
                this.angulartics.eventTrack.next({ action: type + 'CommentCreate', properties: { category: 'projectAction', label: 'failure' }})
                // We should figure out how to handle this properly!
                // Maybe show a warning icon?
                console.warn(error)
            })
    }

    commentsByIndexUpdate(comment, wordIndex: number, commentIndex: number) {
        this.commentsByIndex[wordIndex][commentIndex].data = comment.data
    }

    commentsByIndexAdd(comment, index: number, addQuietly ?: boolean): void {
        let start = comment.start
        // Give it the Project Id to pass down to the Comment Component
        this.decorateComment(comment)

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
        this.updateAllLineCounts()
        this._projects.commentStats.addCommentToStats(commentPointer, 1)
    }

    private decorateComment(comment: any) {
        comment.project_id = this.project._id
        if (comment.user_id === this.user._id || comment.user_id === this.project.teacher_id) {
            comment.showAvatar = true
        }
    }

    /**
     * Removes comment from locally transformed array (commentsByIndex)
     */
    commentsByIndexRemove(commentId, index: number, commentIndex: number) {
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
        // Clear active comment
        this.inactivateComment()
        // Remove from index reference object
        for (let i=0; i < this.commentsByIndex[index].length; i++) {
            if (this.commentsByIndex[index][i]._id == commentId) {
                this.commentsByIndex[index].splice(i, 1)
                break
            }
        }
        // Update line counts
        this.updateAllLineCounts()
        
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
        this.commentsByIndexRemove(comment._id, index, commentIndex)
        this.unfocusHighlight(comment.start, comment.end)
    }

    setActiveCommentByIndex(isActive: boolean, wordIndex: number, commentIndex: number): void {
        if (isActive) {
            this.inactivateComment()
            this._comments.activeComment = this.commentsByIndex[wordIndex][commentIndex]
            this._comments.activeComment.active = true
        } else {
            this.inactivateComment()
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
                    if (word.str.trim().length < 1) {
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
        for (var i = start; i <= end; i ++) {
            // if (this.focusArray[i] = true) {
                this.focusArray[i] = false
            // } 
        }
        this.imageHotspotPlaceholder['focus'] = false
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
     * Magically snap the row for image comments
     */
    private getClosestRowY(yValue: number) : number {
        return yValue + 16 - (yValue)%32
    }

    /**
     * Decides if the Emoji Keyboard is active
     */
    private isEmojiKeyboardActive() : boolean {
        // return this._comments.isEmojiKeyboardActive(this.user)
        this._comments.isEmojiKeyboardActive(this.user)
        return this._comments.keyboardActive
    }

    private discReplyFire(comment) {
        setTimeout(() => {
            // comment.active = true
        }, 500)
        this.replyComment = comment
        this.showDiscussions = true
    }
}

