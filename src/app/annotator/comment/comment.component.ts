import { Subscription } from 'rxjs/Rx';
import { CommentStmt } from '@angular/compiler/src/output/output_ast'
import { Component, EventEmitter, Input, OnInit, Output, SimpleChange, ElementRef } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

import { ProjectService } from '../../shared/project.service'
import { CommentService } from '../../shared/comment.service'
import { AuthService } from '../../shared/auth.service'
import { EdjiComment, CommentPermissions, EdjiQuestion } from './../../shared/datatypes'

@Component({
  selector: 'edji-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

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
  // Is fully visible, focused, but not editable
  private preview = false
  private reRecordAudio = false
  private showDeleteModal: boolean = false
  private user: any
  private subscriptions: Subscription[] = []
  private repliesById: any = {}
  private project: any

  @Input() public comment: EdjiComment
  @Input() private readOnly: boolean = false
  @Input() private replyRef: boolean = false
  @Input() private reply: boolean = false   // Is it a reply to another comment? 
  @Input() private commentLite: boolean = false
  @Input() private commentContext: string = 'normal'; // See NOTES in summary.
  @Input() private assignedQuestion : EdjiQuestion; // If this is an answer, it'll need this.
  @Input() private userPermission: number = CommentPermissions.READ
  @Input() private showDeleteAudioModal: boolean = false
  @Input()
  set isActive(isActive: boolean) {
    if (typeof(isActive) !== 'undefined' && this.active !== isActive) {
      this.toggleActive()
    }
  }
  get isActive(): boolean { return this.active }

  @Output() commentDeleted = new EventEmitter<string>()
  @Output() commentActivation = new EventEmitter<boolean>()
  @Output() commentDeactivate: EventEmitter<any> = new EventEmitter<any>()
  @Output() expandLine = new EventEmitter<number>()
  @Output() collapseLine = new EventEmitter<number>()
  @Output() dismissKeyboard = new EventEmitter()
  @Output() commentUpdated: EventEmitter<any> = new EventEmitter()
  @Output() mobileActivation = new EventEmitter()
  @Output() mobileDeactivation = new EventEmitter()
  @Output() commentReply = new EventEmitter()

  constructor(
        private _projects: ProjectService,
        private angulartics: Angulartics2,
        private _comments: CommentService,
        private _auth: AuthService,
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
    ) )

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
    ) )
  }

  toggleActive( ): void {
      if (!this.readOnly) {
        if (this.active) {
            this.active = false
            this.commentActivation.emit(false)
            this._comments.activeComment.active = false
            // Save when comment is toggled away from
            this.updateComment(this.comment.data)
        } else {
          this.active = true 
          this._comments.activeComment = this.comment
          this._comments.activeComment.active = true
          this.commentActivation.emit(true)
        }
      } else {
        this.togglePreview()
      }
      
  }

  activate(event): void {
    setTimeout(() => {
      // Ignore if user is just clicking a link
      if ((this.preview && event && ['a','i'].indexOf(event.target.tagName.toLowerCase()) > -1) || this._comments.editing) {
        // Let click open link
      } else {
        if (!this.readOnly) {
          // this.active = true
          // this.commentActivation.emit(true)
          this.toggleActive()
        } else {
          this.togglePreview()
        }
      }
    }, 100)
  }

  togglePreview(): void {
      if (this.preview === true) {
        this.preview = false
        this.commentActivation.emit(false)
        this._comments.activeComment.active = false
      } else {
        this.preview = true
      }
  }

  deactivate(commentData ?: any): void {
    this.active = false
    this.commentActivation.emit(false)
    this._comments.activeComment.active = false
    // Save when comment is toggled away from
    if (commentData) {
      this.updateComment(commentData.data);
    } // if
  } // deactivate(commentData ?: any): void

  alwaysActive(): void {
    if (!this.active) {
      this.active = true 
      this._comments.activeComment = this.comment
      this._comments.activeComment.active = true
      this.commentActivation.emit(true)
    }
  }

  // Updates comment in db
  public updateComment(commentData: EdjiComment): void {
    this.reRecordAudio = false
    if (commentData._id) {
      // this.comment.project_id, commentData, this.comment.start, this.comment.end, this.comment.type, this.comment.text, this.comment._id, this.comment.loc
      this.comment.data = commentData.data
      this.comment.url = commentData.url
    } else {
      this.comment.data = commentData
    } // else

    if (this.commentContext !== "answer") {
      if (this.commentContext === "reply") {
        // If this is a reply comment
        this.angulartics.eventTrack.next({ action: 'updateReply', properties: { category: 'heroFeature', label: 'attempt' }})
        this.isLoading = true
        this._projects.addCommentToReplies(this.comment)
      } else {
        // If it is a regular comment.
        this.angulartics.eventTrack.next({ action: 'updateComment', properties: { category: 'projectAction', label: 'attempt' }})
        this.isLoading = true
      } // else
      this._projects.saveComment(this.comment)
      .then(comment => {
        // Appropriate post-delete action, sorted by comment type.
        if (this.commentContext === 'reply') {
          this.angulartics.eventTrack.next({ action: 'updateReply', properties: { category: 'heroFeature', label: 'success' }})
        } else {
          this.angulartics.eventTrack.next({ action: 'updateComment', properties: { category: 'projectAction', label: 'success' }})
        } // else
        this.isLoading = false
        
        this.justSaved = true
        this.commentUpdated.emit()
        setTimeout(() => {
          this.justSaved = false
          this.comment.active = false
        }, 1000)
      })
      .catch(error => { 
        // Appropriate post-delete failure action, sorted by comment type.
        if (this.commentContext === 'reply' || this.commentContext === 'answer') {
          this.angulartics.eventTrack.next({ action: 'updateReply', properties: { category: 'heroFeature', label: 'failure' }})
        } else {
          this.angulartics.eventTrack.next({ action: 'updateComment', properties: { category: 'projectAction', label: 'failure' }})
        } // else

        console.log(error)
      })
    } else {
      this.angulartics.eventTrack.next({ action: 'updateAnswer', properties: { category: 'heroFeature', label: 'attempt' }})
      this.isLoading = true
      this._projects.addAnswerToAnswers(this.comment)
      this._projects.saveAnswer(this.comment)
      .then(answer => {
        this.angulartics.eventTrack.next({ action: 'updateAnswer', properties: { category: 'heroFeature', label: 'success' }})

        this.isLoading = false
        
        this.justSaved = true
        this.commentUpdated.emit()
        this._projects.addAnswerToAnswers(answer)
        setTimeout(() => {
          this.justSaved = false
          this.comment.active = false
        }, 1000)
      })
      .catch(error => { 
        this.angulartics.eventTrack.next({ action: 'updateAnswer', properties: { category: 'heroFeature', label: 'failure' }})

        console.log(error)
      })
    }


  } // public updateComment(commentData: any, reply ?: boolean): void

  // Deletes comment via Project service, which updates the local Project object
  public deleteComment(comment: any) : void {
    // Sort through the comment types and do the apppropriate pre-delete action
    if (this.comment.reply_to) {
      this.angulartics.eventTrack.next({ action: 'deleteReply', properties: { category: 'heroFeature', label: 'attempt' }})
    } else if (this.comment.questionId) {
      this.angulartics.eventTrack.next({ action: 'deleteAnswer', properties: { category: 'heroFeature', label: 'attempt' }})
    } else {
      this.angulartics.eventTrack.next({ action: 'deleteComment', properties: { category: 'projectAction', label: 'attempt' }})
    }

    if (this.commentContext !== 'answer') {
      this._projects.deleteComment(comment)
      .then(data => {
        // Sort through the comment types and do the apppropriate post-delete action
        if (this.comment.reply_to) {
          this._projects.removeCommentFromReplies(this.comment)
          this.angulartics.eventTrack.next({ action: 'deleteReply', properties: { category: 'heroFeature', label: 'success' }})
        } else {
          this.angulartics.eventTrack.next({ action: 'deleteComment', properties: { category: 'projectAction', label: 'success' }})
        }
        
        // Tell Annotator to destroy this comment element!
        this.showDeleteModal = false
      })
      .catch(error => {
        // TRACK EXCEPTION
        this.angulartics.eventTrack.next({ action: 'deleteReply', properties: { category: 'heroFeature', label: 'failure' }})
        console.log(error)
      })
    } else {
      this._projects.deleteAnswer(comment)
      .then(data => {
        this._projects.removeAnswerFromAnswers(this.comment)
        this.angulartics.eventTrack.next({ action: 'deleteAnswer', properties: { category: 'heroFeature', label: 'success' }})
        this.showDeleteModal = false
      })
      .catch(error => {
        // TRACK EXCEPTION
        this.angulartics.eventTrack.next({ action: 'deleteAnswer', properties: { category: 'heroFeature', label: 'failure' }})
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
}