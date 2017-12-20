import { Subscription } from 'rxjs/Rx';
import { CommentStmt } from '@angular/compiler/src/output/output_ast'
import {
    AfterViewInit,
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

import { ProjectService } from '../../shared/project.service'
import { CommentService } from '../../shared/comment.service'
import { AuthService } from '../../shared/auth.service'
import { UtilToolService } from '../../shared/util-tool.service'
import { AnnotatorComponent } from '../annotator.component'
import { EdjiComment, CommentPermissions, EdjiQuestion } from './../../shared/datatypes'

@Component({
  selector: 'edji-comment',
  templateUrl: './comment.component.pug',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, AfterViewInit, OnDestroy {

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
  public expanded: boolean = false

  private yPos: number = 0
  private justSaved: boolean = false
  private isLoading: boolean = false
  // Hold the current scroll position for the iOS fix
  private currentScroll: number
  // Is fully visible, focused, and editable
  private active = false
  // // Is fully visible, focused, but not editable
  // private preview = false
  private reRecordAudio = false
  private showDeleteModal: boolean = false
  private user: any
  private subscriptions: Subscription[] = []
  private repliesById: any = {}
  // private commentByPos: any = []
  private project: any
  private commentPane: boolean
  private indicatesPane: boolean
  private lineIconNum: number = 0
  private iconNum: number = 0

  @Input() public comment: EdjiComment
  @Input() private readOnly: boolean = false
  @Input() private replyRef: boolean = false
  @Input() private reply: boolean = false   // Is it a reply to another comment? 
  @Input() private commentLite: boolean = false
  @Input() private commentContext: string = 'normal'; // See NOTES in summary.
  @Input() private commentMobile: boolean = false
  @Input() private commentMobileFirst: boolean = false
  @Input() private commentPaneActive: boolean = false
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
        public el: ElementRef
      ) { }

  ngOnInit() {
    // Set initial values if passed
    if (!this.reply) {
      if (this.comment.lineCount) {
        this.lineCount = this.comment.lineCount
      } 
      if (this.comment.expanded) {
        this.expanded = this.comment.expanded
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
    
    // Subscribe to updates to the comment by line number position array
    this.subscriptions.push( this._projects.refreshLineCount.subscribe(
      () => {
        this.setLineY()
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

    // window.addEventListener('resize', () => {
    //     this.setLineY()
    // }, true);
  }

  ngAfterViewInit() {
    this.setLineY()
  }

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
          let lineY = (this.comment.loc.y/100) * imageHeight
          lineY = Math.round( imageTop + lineY - firstWordTop )
          this.comment.lineY = lineY + 16 - (lineY)%32
      } else {
          // Math.round(allthis.Comments[i].nativeElement.getBoundingClientRect().bottom - firstWordTop)
          let wordY = commentWord.getBoundingClientRect().bottom
          wordY = Math.round(wordY - firstWordTop)
          this.comment.lineY = wordY + 16 - (wordY)%32
      }
    } else {
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
   * Returns comment block's y position
   * - Used for collapse/expand multiple comments
   */
  public getVerticalPosition(): number {
    // The parentNode offsetTop addition fixes the occasional issue where diferrent images have comments registering on the same line
    this.yPos = Math.round(this.el.nativeElement.offsetTop) + Math.round(this.el.nativeElement.parentNode.offsetTop)
    // Certain styles can cause the position to vary by up to 5 pixels, so we need to round further
    this.yPos = Math.round(this.yPos/15) * 15
    return this.yPos
  } // public getVerticalPosition(): number

  /**
   * Collapse all stacked comments on the same line
   */
  collapse(): void {
    this.collapseLine.emit(this.yPos)
  }

  /**
   * Expand all stacked comments on the same line
   */
  expand(): void {
    this.expandLine.emit(this.yPos)
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }

  toggleCPane(comment?, forceOpen?: boolean): void {
    if (!this.commentPaneActive) {
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

  getIconNumber(comment): void {
    if (!comment.reply_to && !comment.questionId) {
      this.lineIconNum = this._projects.lineNumberArray[comment.start]
      // this.iconNum = this._projects.commentByPosSource[this.lineIconNum].length
    }
  }

  getComments(comment): void {
    // console.log(this._projects.commentByPosSource[this._projects.lineNumberArray[comment.start]])
  }
}