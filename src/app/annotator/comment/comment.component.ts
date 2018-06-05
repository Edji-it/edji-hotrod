import { Subscription } from 'rxjs';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    SimpleChange,
} from '@angular/core';
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, CommentService, ProjectService, UtilToolService, AcademyService } from '../../_services'
import { AnnotatorComponent } from '../annotator.component'
import { EdjiComment, CommentPermissions, EdjiQuestion } from './../../shared/datatypes'
import { ALLSPARK } from './../../app.constants'

@Component({
  selector: 'edji-comment',
  templateUrl: './comment.component.pug',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, OnDestroy {

  /*
  Front end implementation of a comment.
  Last Mod: 5 Aug 2017

  NOTES:
    commentContext : string - 8.5.17
      For saying what context the comment is used in. Use 'normal' for normal comments,
      'reply' for comment replies, and 'answer' for answers to questions.

  What you'll need for:
    - making comment as an answer
      - commentContext
      - assignedQuestion
  */

  public lineCount: number = 1
  public indexOnLine: number = 1
  
  private justSaved: boolean = false
  private isLoading: boolean = false
  // Hold the current scroll position for the iOS fix
  private currentScroll: number
  // Is fully visible, focused, and editable
  private active = false
  private reRecordAudio = false
  private showDeleteModal: boolean = false
  private user: any
  private subscriptions: Subscription[] = []
  private repliesById: any = {}
  private commentsByPos: any = []
  private project: any
  private commentPane: boolean
  private indicatesPane: boolean

  @Input() public comment: EdjiComment
  @Input() private readOnly: boolean = false
  @Input() private replyRef: boolean = false
  @Input() public reply: boolean = false   // Is it a reply to another comment? 
  @Input() private commentLite: boolean = false
  @Input() private commentContext: string = 'normal'; // See NOTES in summary.
  @Input() public commentMobile: boolean = false
  @Input() public commentMobileFirst: boolean = false
  @Input() public commentPaneActive: boolean = false
  @Input() private assignedQuestion : EdjiQuestion; // If this is an answer, it'll need this.
  @Input() private userPermission: number = CommentPermissions.READ
  @Input() private showDeleteAudioModal: boolean = false
  @Input()
  set isActive(isActive: boolean) {
    if (typeof(isActive) !== 'undefined' && this.active !== isActive) {
      this.active = isActive
      if (!isActive) {
        // Trigger save when deactivated externally i.e. emoji keyboard
        this.deactivate(this.comment)
      } else {
        this.toggleCPane(this.comment, true)
      }
    } 
  }
  get isActive(): boolean { return this.active }

  @Output() commentDeleted = new EventEmitter<string>()
  @Output() commentActivation = new EventEmitter<boolean>()
  @Output() commentDeactivate: EventEmitter<any> = new EventEmitter<any>()
  @Output() expandLine = new EventEmitter<number>()
  @Output() commentPaneExpand = new EventEmitter<number>()
  @Output() collapseLine = new EventEmitter<number>()
  @Output() dismissKeyboard = new EventEmitter()
  @Output() commentUpdated: EventEmitter<any> = new EventEmitter()
  @Output() commentReply = new EventEmitter()
  @Output() toggleCommentPane = new EventEmitter<boolean>()

  constructor(
        private _projects: ProjectService,
        private angulartics: Angulartics2,
        private _comments: CommentService,
        private _auth: AuthService,
        private _util: UtilToolService,
        public el: ElementRef,
        private _academy: AcademyService
      ) { }

  ngOnInit() {
    // Set initial values if passed
    if (!this.reply) {
      if (this.comment.lineCount) {
        this.lineCount = this.comment.lineCount
      } 
    }

    /** Set the current user every time it changes */
    this.subscriptions.push(
        this._auth.getCurrentUser().subscribe((user) => {
            this.user = user
        })
    )

    // Subscribe to updates to the reply reference object
    this.subscriptions.push( this._projects.repliesById.subscribe(
      (repliesById) => {
        this.repliesById = repliesById
      },
      (error) => {
        console.error(error)
      }
    ))

    // Subscribe to updates from that project once we're subscribed to the reading
    this.subscriptions.push( this._projects.currentProject.subscribe(
      (project) => {
        if (project) {
          this.project = project
        }
      },
      (error) => {
        console.error(error)
      }
    ))

    // Certain events require a top-down decision to deactivate comments
    this.subscriptions.push( this._comments.clearActiveComments.subscribe(
      (deactivate) => {
        this.deactivate()
      },
      (error) => {
        console.error(error)
      }
    ))

    // Change mobile icon state if pane closes
    this.subscriptions.push(this._projects.commentPaneState.subscribe(
      (paneState) => {
        // We can ONLY use this subscription to CLEAR the indicatesPane var to *false*
        if (paneState === false) {
          this.indicatesPane = false
        }
      }
    ))

    this.subscriptions.push(this._projects.commentByPos.subscribe(
      (commentsByPos) => {
        this.commentsByPos = commentsByPos
        this.updateLineCount()
      }
    ))
  }

  /**
   * Get nearest baseline as integer
   * @param vYalue: number The y position in pixels
   * @returns number Nearest baseline Y value
   */
  private nearestLine(yValue: number) : number {
    return yValue + (ALLSPARK.BASELINEHEIGHT/2) - yValue%ALLSPARK.BASELINEHEIGHT
  }

  /**
   * Calculates lineY and imageY values for rendering
   * - lineY is required by commentByPos in ProjectService
   * - imageY provides consistent and lighter comment positioning on images
   */
  setLineY() {
    let firstWord = document.querySelector('.w[index="1"]')
    let commentWord = document.querySelector( '.w[index="'+this.comment.start+'"]')
    let commentImage = document.getElementById('readingImage' + this.comment.start)

    if (firstWord && (commentWord || commentImage)) {
      let firstWordTop: number = firstWord.getBoundingClientRect().bottom

      // This will need to re-decorate on resize
      if (this.comment.loc && this.comment.loc.y && this.comment.text === "") {
          let imageTop: number = commentImage.getBoundingClientRect().top
          let imageHeight = commentImage.clientHeight
          // Get nearest baseline (Y) of comment within image
          let imageY = (this.comment.loc.y/100) * imageHeight
          this.comment.imageY = imageY = this.nearestLine(imageY)

          // Get image offset for Line Y value
          let imageOffset = imageTop - firstWordTop 
          imageOffset = this.nearestLine(imageOffset)
          this.comment.lineY = imageY + imageOffset
      } else {
          // Math.round(allthis.Comments[i].nativeElement.getBoundingClientRect().bottom - firstWordTop)
          let wordY = commentWord.getBoundingClientRect().bottom
          wordY = wordY - firstWordTop
          this.comment.lineY = this.nearestLine(wordY)
      }
    } else {
      console.log("Looking for y position of comment not yet rendered...")
      setTimeout(()=> {
        this.setLineY()
      }, 1000)
    }
  }

  activate(event?: any): void {
    // Deactivate any active comments
    this._comments.deactivateAllComments()

    // Activate this comment
    this.comment.active = this.active = true
    this._comments.activeComment = this.comment
    this._comments.activeComment.active = true
    this.commentActivation.emit(true)
  }

  /**
   * Deactivates/unfocuses comment, and optionally triggers save
   * @param comment (optional) Full EdjiComment object
   * TO-DO: Clean out code for optionally passing JUST comment.data as comment parameter
   */
  deactivate(comment ?: any, noUpdate ?: boolean): void {
    this.comment.selected = false
    this.comment.active = this.active = false
    this.comment.new = false
    this.commentActivation.emit(false)
    this._comments.activeComment.active = false
    // Save when comment is toggled away from
    if (comment && !noUpdate) {
      this.updateComment(comment)
    }
  } // deactivate(commentData ?: any): void

  /**
   * Saves updates to comments
   * @param comment Full EdjiComment object
   */
  public updateComment(comment: EdjiComment): void {
    this.reRecordAudio = false
    if (comment._id) {
      // this.comment.project_id, comment, this.comment.start, this.comment.end, this.comment.type, this.comment.text, this.comment._id, this.comment.loc
      this.comment.data = comment.data
      this.comment.url = comment.url
    } else {
      this.comment.data = comment
    } // else

    if (this.commentContext !== "answer") {
      if (this.commentContext === "reply") {
        // If this is a reply comment
        this.angulartics.eventTrack.next({ action: comment.type + 'updateReply', properties: { category: 'heroFeature', label: 'attempt' }})
        this.isLoading = true
        this._projects.addCommentToReplies(this.comment)
      } else {
        // If it is a regular comment.
        this.angulartics.eventTrack.next({ action: comment.type + 'updateComment', properties: { category: 'projectAction', label: 'attempt' }})
        this.isLoading = true
      } // else
      this._projects.saveComment(this.comment)
      .then(comment => {
        // Appropriate post-delete action, sorted by comment type.
        if (this.commentContext === 'reply') {
          this.angulartics.eventTrack.next({ action: comment.type + 'updateReply', properties: { category: 'heroFeature', label: 'success' }})
        } else {
          this.angulartics.eventTrack.next({ action: comment.type + 'updateComment', properties: { category: 'projectAction', label: 'success' }})
        } // else
        this.isLoading = false
        this.commentUpdated.emit()

        this.justSaved = true
        setTimeout(() => {
          this.justSaved = false
          // this.comment.active = false
        }, 1000)
      })
      .catch(error => { 
        // Appropriate post-delete failure action, sorted by comment type.
        if (this.commentContext === 'reply' || this.commentContext === 'answer') {
          this.angulartics.eventTrack.next({ action: comment.type + 'updateReply', properties: { category: 'heroFeature', label: 'failure' }})
        } else {
          this.angulartics.eventTrack.next({ action: comment.type + 'updateComment', properties: { category: 'projectAction', label: 'failure' }})
        } // else

        console.log(error)
      })
    } else {
      this.angulartics.eventTrack.next({ action: comment.type + 'updateAnswer', properties: { category: 'heroFeature', label: 'attempt' }})
      this.isLoading = true
      this._projects.addAnswerToAnswers(this.comment)
      this._projects.saveAnswer(this.comment)
      .then(answer => {
        this.angulartics.eventTrack.next({ action: comment.type + 'updateAnswer', properties: { category: 'heroFeature', label: 'success' }})

        this.isLoading = false
        
        this.commentUpdated.emit()
        this._projects.addAnswerToAnswers(answer)

        this.justSaved = true
        setTimeout(() => {
          this.justSaved = false
          // this.comment.active = false
        }, 1000)
      })
      .catch(error => { 
        this.angulartics.eventTrack.next({ action: comment.type + 'updateAnswer', properties: { category: 'heroFeature', label: 'failure' }})
        console.log(error)
      })
    }
  } // public updateComment(comment: any, reply ?: boolean): void

  // Deletes comment via Project service, which updates the local Project object
  public deleteComment(comment: any) : void {
    // Stop the user from continuing to edit, and close emoji keyboard
    // Sort through the comment types and do the apppropriate pre-delete action
    if (this.comment.reply_to) {
      this.angulartics.eventTrack.next({ action: comment.type + 'deleteReply', properties: { category: 'heroFeature', label: 'attempt' }})
    } else if (this.comment.questionId) {
      this.angulartics.eventTrack.next({ action: comment.type + 'deleteAnswer', properties: { category: 'heroFeature', label: 'attempt' }})
    } else {
      this.angulartics.eventTrack.next({ action: comment.type + 'deleteComment', properties: { category: 'projectAction', label: 'attempt' }})
    }

    if (this.commentContext !== 'answer') {
      this._projects.deleteComment(comment)
      .then(data => {
        // Sort through the comment types and do the apppropriate post-delete action
        if (this.comment.reply_to) {
          this._projects.removeCommentFromReplies(this.comment)
          this.angulartics.eventTrack.next({ action: comment.type + 'deleteReply', properties: { category: 'heroFeature', label: 'success' }})
        } else {
          this.angulartics.eventTrack.next({ action: comment.type + 'deleteComment', properties: { category: 'projectAction', label: 'success' }})
        }
        
        // Tell Annotator to destroy this comment element!
        this.showDeleteModal = false
      })
      .catch(error => {
        // TRACK EXCEPTION
        if (this.comment.reply_to) {
          this.angulartics.eventTrack.next({ action: comment.type + 'deleteReply', properties: { category: 'heroFeature', label: 'failure' }})
        } else {
          this.angulartics.eventTrack.next({ action: comment.type + 'deleteComment', properties: { category: 'projectAction', label: 'failure' }})
        }
        this.deactivate(this.comment)
        console.log(error)
      })
    } else {
      this._projects.deleteAnswer(comment)
      .then(data => {
        this._projects.removeAnswerFromAnswers(this.comment)
        this.angulartics.eventTrack.next({ action: comment.type + 'deleteAnswer', properties: { category: 'heroFeature', label: 'success' }})
        this.showDeleteModal = false
      })
      .catch(error => {
        // TRACK EXCEPTION
        this.angulartics.eventTrack.next({ action: comment.type + 'deleteAnswer', properties: { category: 'heroFeature', label: 'failure' }})
        this.deactivate(this.comment)
        console.log(error)
      })
    }
  } // deleteComment(comment: any) : void

  /**
   * Collapse all stacked comments on the same line
   */
  collapse(): void {
    this.collapseLine.emit(this.comment.lineY)
  }

  /**
   * Expand all stacked comments on the same line
   */
  expand(): void {
    this.expandLine.emit(this.comment.lineY)
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }

  toggleCPane(comment?, forceOpen?: boolean): void {
    if (!this.commentPaneActive) {
      if (comment.selected) {
        this.comment.selected=true
      }
       // Need to give the app 1 millisecond to update all arrays when adding a new comment
      if (!this.indicatesPane || forceOpen) {
        setTimeout(() => {
          this.indicatesPane = true
          this.toggleCommentPane.emit(true)
        }, 1)
      } else {
        setTimeout(() => {
          this.indicatesPane = false
          this.toggleCommentPane.emit(false)
        }, 1)
      }
    }
  }

  updateLineCount(): void {
    if (this.comment.lineY) {
      let commentsOnLine = this.commentsByPos[this.comment.lineY]
      this.lineCount = commentsOnLine && commentsOnLine.length
      for (let i = 0; i < this.lineCount; i++){
        if (commentsOnLine[i]._id == this.comment._id) {
          this.indexOnLine =  this.lineCount - i 
        }
      }
    } else {
      this.lineCount = 1
    }
  }
}