import { Project, User } from '../datatypes'
import { Subscription } from 'rxjs'
import { CommentPermissions, EdjiComment } from '../datatypes/index'
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'

// Project Dependencies
import { AuthService, ProjectService, CommentService, SocketService } from '../../_services'
import { Angulartics2 } from 'angulartics2';
@Component({
  selector: 'comment-pane',
  templateUrl: './comment-pane.component.pug',
  styleUrls: ['./comment-pane.component.scss']
})
export class CommentPaneComponent implements OnInit, OnDestroy {

  // General variables for the comment pane component
  public commentPane: boolean
  public lineNum: number = 0
  public commentCount: number = 0
  public rowComments: EdjiComment[][] = []
  // Reply variables
  public repliesById: any = {}
  public replyCommentNew: EdjiComment
  // Is fully visible, focused, and editable
  public active = false
  public selected = false
  public user: User
  public project: Project = <Project>{}
  public visible: boolean

  // Subscriptions and related
  public subscriptions: Subscription[] = []
  public commentByPos: any[] = []

  // Comment Pane Component Inputs
  @Input() comment: EdjiComment
  @Input()
  set isActive(isActive: boolean) {
    if (typeof(isActive) !== 'undefined' && this.active !== isActive) {
      this.active = isActive
      
      // if the comment is new, let's adjust the scroll position if there are a ton of comments
      if (this.comment.new) {
        this.scrollAdjust()
      }
    } 
  }
  // Checking for selected in the instances where a user clicks on the avatar and we want to scroll to that comment while adding the associated classes
  @Input()
  set isSelected(isSelected: boolean) {
    if (typeof(isSelected) !== 'undefined' && this.selected !== isSelected) {
      this.selected = isSelected
      
      // if the comment was selected then we'll need to scroll to it, but not activate it
      if (this.comment.selected) {
        this.scrollAdjust(this.comment)
      }
    } 
  }

  // Comment Pane Component Outputs
  @Output() hideComment = new EventEmitter()
  @Output() commentActivationMobile = new EventEmitter<any>()
  @Output() commentUpdated: EventEmitter<any> = new EventEmitter()
  @Output() commentReply = new EventEmitter()

  constructor(
      private _projects: ProjectService,
      private _socket: SocketService,
      public el: ElementRef,
      private _auth: AuthService,
      private _comments: CommentService,
      private angulartics: Angulartics2
    ) { }

  ngOnInit() {
    // Subscribe to updates to the comment by line number position array
    this.subscriptions.push( 
      this._projects.commentByPos.subscribe(
        (commentByPos) => {
          this.commentByPos = commentByPos
        },
        (error) => {
          console.error(error)
        }
      ),
      /** Set the current user every time it changes */
      this._auth.getCurrentUser().subscribe((user) => {
          this.user = user
      }),
      // Subscribe to updates from that project once we're subscribed to the reading
      this._projects.currentProject.subscribe(
        (project) => {
          if (project) {
            this.project = project
          }
        },
        (error) => {
          console.error(error)
        }
      ),
      this._projects.commentPaneState.subscribe(
        (paneState) => {
          this.visible = paneState
          if (paneState) {
            document.body.classList.add("body__lock-scroll")
          } else {
            document.body.classList.remove("body__lock-scroll")
          }
        }
      ),
      // Subscribe to updates to the reply reference object
      this._projects.repliesById.subscribe(
        (repliesById) => {
          this.repliesById = repliesById
        },
        (error) => {
          console.error(error)
        }
      )
    )

    // Subscribe to Heat Vision toggle updates
    this.subscriptions.push(
        this._socket.heatVisionUpdates.subscribe((heatToggle) => {
            this.project.heat_vision = heatToggle.heatVision.all
        })
    )
  }

  dismissCommentPane() {
    this.selected=false
    this.comment.selected=false
    this.hideComment.emit()
    this._projects.commentPaneStateSubj.next(false)
    document.body.classList.remove("body__lock-scroll")
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
    document.body.classList.remove("body__lock-scroll")
  }

  scrollAdjust(iselected?: EdjiComment) {
    setTimeout(() => {
      // Get the comments that are currently in the pane
      let comments: any[] = Array.from(document.querySelectorAll('.sliding-pane-comment .comment-container edji-comment'))
      let len
      let commentIndex = 0
      let paneComments = this.commentByPos[this.comment['lineY']]

      // Get the position of the active comment in the list of comments in comment pane
      if (this.comment.lineY) {
        len = paneComments.length
        for (let i=0; i<len; i++) {
          // If comment is new and active, we'll scroll to it and add the associated active classes
          if (paneComments[i]._id===this._comments.activeComment._id) {
            commentIndex = i
            break
          }
          // If the user selected the avatar, we'll scroll to it and add flair with a class that checks for comment.selected
          if (iselected && paneComments[i]._id===this.comment._id) {
            commentIndex = i
            break
          }
        }
      } 
      
      // Set the scroll position to where the active comment is in view
      if (comments[commentIndex]) { 
        document.querySelector('.sliding-pane-comment').scrollTop = comments[commentIndex].offsetTop
      }
    }, 1)
  }

  commentActivationEmitter(shouldActivate, comment?: any) {
    let wordIndex = comment.start
    // let processedCommentData = this._projects.processComments(this.project)
    let commentsByIndex = this._projects.commentsByIndex

    let commentIndex = 0

    
    
    if (shouldActivate) {
      for (let i=0;i<commentsByIndex[wordIndex].length;i++) {
        if (commentsByIndex[wordIndex][i]._id===comment._id) {
          commentIndex = i
          break
        }
      }

      if (comment && (comment.type==='emoji' || comment.type==='text')) {
        this.scrollAdjust()
      }
      this.commentActivationMobile.emit({activate: shouldActivate, wi: wordIndex, ci: commentIndex, activatedComment: comment})
    } else {
      this.commentActivationMobile.emit({activate: shouldActivate})
    }
  }

  commentUpdatedEmitter() {
    this.commentUpdated.emit()
  }

  commentReplyEmitter(comment) {
    this.commentReply.emit(comment)
  }

  /**
   * Create a Comment of any Type
   * - Fired from comment options tooltip
   * Requires three parameters, and finds the other information it needs
   * @param type What kind of reply comment: emoji, text...
   */
  addReplyOfType(type: string): void {
    let commentId = this.comment._id

    this.angulartics.eventTrack.next({ action: type + 'ReplyCreate', properties: { category: 'heroFeature', label: 'attempt' }})
    
    var replyCommentNew = <EdjiComment>{
      user_id: this.user._id,
      author: this.user.fullname,
      reply_to: commentId,
      data  : '',
      type  : type
    }

    replyCommentNew.new = true
    // replyCommentNew.active = true
    this.replyCommentNew = replyCommentNew

    if (type=='emoji') {
      this.activeEmojiKeyboardReply(this.replyCommentNew)
    }

    // Tell the server we've added a comment.
    this._projects.saveComment(this.replyCommentNew)
    .then(comment => {
      this.angulartics.eventTrack.next({ action: type + 'ReplyCreate', properties: { category: 'heroFeature', label: 'success' }})
      comment.active = true
      this._comments.activeComment = comment
      this._projects.addCommentToReplies(comment)
    })
    .catch(error => {
      // TRACK EXCEPTION
      this.angulartics.eventTrack.next({ action: type + 'ReplyCreate', properties: { category: 'heroFeature', label: 'failure' }})
      console.log(error)
    })
  } // createReplyComment(type: string): void

  /** Used to determine which level of permission the user has for a specific comment
   * @param comment A comment object
   */
  private getCommentPermissions(comment: any): number {
      return this._comments.getCommentPermissions(comment, this.user, this.project)
  }

  private activeEmojiKeyboardReply(activeReply: any): void {
    this._comments.activeComment = activeReply
    this._comments.setEmojiKeyboardActive(this.user)
  }
}