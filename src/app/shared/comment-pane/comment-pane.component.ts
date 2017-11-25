import { CommentService } from '../comment.service'
import { AuthService } from '../auth.service' 
import { SocketService } from '../socket.service'
import { Project, User } from '../datatypes'
import { Subscription } from 'rxjs/Rx'
import { ProjectService } from '../index'
import { CommentPermissions, EdjiComment } from '../datatypes/index'
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'

@Component({
  selector: 'comment-pane',
  templateUrl: './comment-pane.component.pug',
  styleUrls: ['./comment-pane.component.scss']
})
export class CommentPaneComponent implements OnInit, OnDestroy {

  // General variables for the comment pane component
  private commentPane: boolean
  private lineNum: number = 0
  private commentCount: number = 0
  private rowComments: EdjiComment[][] = []
  // Is fully visible, focused, and editable
  private active = false
  private user: User
  private project: Project = <Project>{}
  private visible: boolean

  // Subscriptions and related
  private subscriptions: Subscription[] = []
  private commentByPos: any[] = []
  private lineNumArray: any[] = []

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

      if (!isActive) {
        // Trigger save when deactivated externally i.e. emoji keyboard
        
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
    ) { }

  ngOnInit() {
    // Subscribe to updates to the comment by line number position array
    this.subscriptions.push( 
      this._projects.commentByPos.subscribe(
        (commentByPos) => {
          this.commentByPos = commentByPos
          this.lineNumArray = this._projects.lineNumberArray
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
            document.body.className = document.body.className.replace("body__lock-scroll","")
          }
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
    this.hideComment.emit()
    this._projects.commentPaneStateSubj.next(false)
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
    document.body.className = document.body.className.replace("body__lock-scroll","")
  }

  scrollAdjust(isNew?: boolean) {
    setTimeout(() => {
      // Get the comments that are currently in the pane
      let comments: any[] = Array.from(document.querySelectorAll('.comment-container edji-comment'))

      var commentIndex = 0

      // Get the position of the active comment in the list of comments in comment pane
      let len = this.commentByPos[this.lineNumArray[this.comment.start][0][0]].length
      for (let i=0; i<len; i++) {
        if (this.commentByPos[this.lineNumArray[this.comment.start][0[0]]][i]._id===this._comments.activeComment._id) {
          commentIndex = i
          break
        }
      }

      // Set the scroll position to where the active comment is in view
      document.querySelector('.sliding-pane-comment').scrollTop = comments[commentIndex].offsetTop
    }, 1)
  }

  commentActivationEmitter(shouldActivate, comment?: any) {
    let wordIndex = comment.start
    let processedCommentData = this._projects.processComments(this.project)
    let commentsByIndex = processedCommentData.commentsByIndex

    let commentIndex = 0

    for (let i=0;i<commentsByIndex[wordIndex].length;i++) {
      if (commentsByIndex[wordIndex][i]._id===comment._id) {
        commentIndex = i
        break
      }
    }
    
    if (shouldActivate) {
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

  /** Used to determine which level of permission the user has for a specific comment
   * @param comment A comment object
   */
  private getCommentPermissions(comment: any): number {
      return this._comments.getCommentPermissions(comment, this.user, this.project)
  }
}