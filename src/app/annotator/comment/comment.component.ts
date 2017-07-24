import { Subscription } from 'rxjs/Rx';
import { CommentStmt } from '@angular/compiler/src/output/output_ast'
import { Component, EventEmitter, Input, OnInit, Output, SimpleChange, ElementRef } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

import { ProjectService } from '../../shared/project.service'
import { CommentService } from '../../shared/comment.service'
import { AuthService } from '../../shared/auth.service'
import { EdjiComment, CommentPermissions } from './../../shared/datatypes'

@Component({
  selector: 'edji-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

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

  @Input() public comment: EdjiComment
  @Input() private readOnly: boolean = false
  @Input() private replyRef: boolean = false
  @Input() private reply: boolean = false
  @Input() private commentLite: boolean = false
  @Input() private userPermission: number = CommentPermissions.READ
  @Input()
  set isActive(isActive: boolean) {
    if (typeof(isActive) !== 'undefined' && this.active !== isActive) {
      this.toggleActive()
    }
  }
  @Input() private showDeleteAudioModal: boolean = false
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
  }

  toggleActive( ): void {
      if (!this.readOnly) {
        if (this.active === true) {
            this.active = false
            this.commentActivation.emit(false)
            this._comments.activeComment.active = false
            // Save when comment is toggled away from
            if (this.comment.reply_to) {
              this.updateComment(this.comment.data, true)
            } else {
              this.updateComment(this.comment.data)
            }
        } else {
          if (this.reply) {
            this.active = true
            this._comments.activeComment = this.comment
            this._comments.activeComment.active = true
          } else {
            this.active = true 
            this.commentActivation.emit(true)
          }
        }
      } else {
        this.togglePreview()
      }
      
  }

  activate(event): void {
      // Ignore if user is just clicking a link
      if (this.preview && ['a','i'].indexOf(event.target.tagName.toLowerCase()) > -1) {
        // Let click open link
      } else {
         if (!this.readOnly) {
            this.active = true
            this.commentActivation.emit(true)
          } else {
              this.togglePreview()
          }
      }
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
      if (this.comment.reply_to) {
        this.updateComment(commentData.data, true)
      } else {
        this.updateComment(commentData.data)
      }
    } else {
      if (this.comment.reply_to) {
        this.updateComment(this.comment.data, true)
      } else {
        this.updateComment(this.comment.data)
      }
    }
  }

  // Updates comment in db
  public updateComment(commentData: any, reply ?: boolean): void {
    this.reRecordAudio = false
    if (commentData._id) {
      // this.comment.project_id, commentData, this.comment.start, this.comment.end, this.comment.type, this.comment.text, this.comment._id, this.comment.loc
      this.comment.data = commentData.data
      this.comment.url = commentData.url
    } else {
      this.comment.data = commentData
    }

    if (reply) {
      // If this is a reply comment
      this.angulartics.eventTrack.next({ action: 'updateReply', properties: { category: 'heroFeature', label: 'attempt' }})
      this.isLoading = true
      this._projects.addCommentToReplies(this.comment)

      this._projects.saveReply(this.comment)
        .then(comment => {
          this.isLoading = false
          this.angulartics.eventTrack.next({ action: 'updateReply', properties: { category: 'heroFeature', label: 'success' }})
          this.justSaved = true
          this.commentUpdated.emit()
          setTimeout(() => {
            this.justSaved = false
            this.comment.active = false
          }, 1000)
        })
        .catch(error => {
          // TRACK EXCEPTION
          this.angulartics.eventTrack.next({ action: 'updateReply', properties: { category: 'heroFeature', label: 'failure' }})
          console.log(error)
        })
    } else {
      // if this is a regular plain old comment
      this.angulartics.eventTrack.next({ action: 'updateComment', properties: { category: 'projectAction', label: 'attempt' }})
      this.isLoading = true

      this._projects.saveComment(this.comment)
        .then(comment => {
          this.isLoading = false
          this.angulartics.eventTrack.next({ action: 'updateComment', properties: { category: 'projectAction', label: 'success' }})
          this.justSaved = true
          this.commentUpdated.emit()
          setTimeout(() => {
            this.justSaved = false
          }, 1000)
        })
        .catch(error => {
          // TRACK EXCEPTION
          this.angulartics.eventTrack.next({ action: 'updateComment', properties: { category: 'projectAction', label: 'failure' }})
          console.log(error)
        })
    }
  }

  // Deletes comment via Project service, which updates the local Project object
  deleteComment(comment: any):void {
    this.angulartics.eventTrack.next({ action: 'deleteComment', properties: { category: 'projectAction', label: 'attempt' }})

    if (this.comment.reply_to) {
        this._projects.removeCommentFromReplies(this.comment)
      }

    this._projects.deleteComment(comment)
      .then(data => {
        this.angulartics.eventTrack.next({ action: 'deleteComment', properties: { category: 'projectAction', label: 'success' }})
        // Tell Annotator to destroy this comment element!
        this.commentDeleted.emit(comment._id)
        this.showDeleteModal = false

        // If comment has associated file, delete file
        if (comment.type == 'audio' && comment.data.length > 0) {
          
        }
      })
      .catch(error => {
        // TRACK EXCEPTION
        this.angulartics.eventTrack.next({ action: 'deleteComment', properties: { category: 'projectAction', label: 'failure' }})
        console.log(error)
      })
  }

  /**
   * Returns comment block's y position
   * - Used for collapse/expand multiple comments
   */
  public getVerticalPosition(): number {
    // The parentNode offsetTop addition fixes the occasional issue where diferrent images have comments registering on the same line
    this.yPos = Math.round(this.el.nativeElement.offsetTop) + Math.round(this.el.nativeElement.parentNode.offsetTop)
    return this.yPos
  }

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