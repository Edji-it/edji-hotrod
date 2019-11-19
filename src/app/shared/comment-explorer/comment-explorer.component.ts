import { Project, User } from '../datatypes'
import { Subscription } from 'rxjs'
import { CommentPermissions, EdjiComment } from '../datatypes/index'
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core'

// Project Dependencies
import { AuthService, CommentService, SocketService } from '../../_services'
import { Angulartics2 } from 'angulartics2'
import { CommentComponent } from 'src/app/annotator/comment/comment.component'
import { ProjectStore } from 'src/app/_store'
import { NgScrollbar } from 'ngx-scrollbar'
@Component({
  selector: 'comment-explorer',
  templateUrl: './comment-explorer.component.pug',
  styleUrls: ['./comment-explorer.component.scss'],
})
export class CommentExplorerComponent implements OnInit, OnDestroy {
  // @ViewChild('commentPane', { static: false }) private commentPane: ElementRef
  // @ViewChildren(CommentComponent) commentComponents: QueryList<CommentComponent>

  // // General variables for the comment pane component
  // public lineNum: number = 0
  // public commentCount: number = 0
  // public rowComments: EdjiComment[][] = []
  // // Reply variables
  // public repliesById: any = {} // Updated via project service
  public repliesToggleById: any = {} // Boolean properties for template
  // public replyCommentNew: EdjiComment
  // // Is fully visible, focused, and editable
  public active = false
  public selected = false
  public user: User
  public project: Project = <Project>{}
  // public visible: boolean

  // // Subscriptions and related
  public subscriptions: Subscription[] = []
  private allComments: EdjiComment[] = []
  public comments: EdjiComment[] = []
  public commentCount: number = 0
  public commentByPos: any[] = []

  // Sort and Filtering
  public sortValue: string = 'created' // default to created

  public filterMode: 'line' | 'all' = 'all'

  // // Comment Pane Component Inputs
  @Input() comment: EdjiComment
  private _visible: boolean
  @Input()
  set visible(visible: boolean) {
    console.log('set visible', visible)
    // if (typeof visible !== 'undefined' && this.active !== visible) {
    this._visible = visible
    // }
    if (visible) {
      this.filterComments()
      this.evaluateShouldScroll()
      document.body.classList.add('body__lock-scroll')
    } else {
      document.body.classList.remove('body__lock-scroll')
    }
  }
  get visible(): boolean {
    return this._visible
  }
  // // Checking for selected in the instances where a user clicks on the avatar and we want to scroll to that comment while adding the associated classes
  // @Input()
  // set isSelected(isSelected: boolean) {
  //   if (typeof isSelected !== 'undefined' && this.selected !== isSelected) {
  //     this.selected = isSelected
  //     this.evaluateShouldScroll()
  //   }
  // }

  // // Comment Pane Component Outputs
  @Output() close = new EventEmitter()
  // @Output() commentUpdated: EventEmitter<any> = new EventEmitter()
  // @Output() commentReply = new EventEmitter()

  @ViewChild(NgScrollbar, { static: true }) scrollable: NgScrollbar

  constructor(
    private projectStore: ProjectStore,
    private _socket: SocketService,
    public el: ElementRef,
    private _auth: AuthService,
    private _comments: CommentService,
    private angulartics: Angulartics2,
  ) {}

  ngOnInit() {
    // Subscribe to updates to the comment by line number position array
    this.subscriptions.push(
      this.projectStore.commentByPos.subscribe(
        commentByPos => {
          this.commentByPos = commentByPos
        },
        error => {
          console.error(error)
        },
      ),
      // /** Set the current user every time it changes */
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
      }),
      // Subscribe to updates from that project once we're subscribed to the reading
      this.projectStore.currentProject.subscribe(
        project => {
          if (project) {
            this.project = project
            this.allComments = project.comments || []
            this.commentCount = this.comments.length
            this.filterComments()
          }
        },
        error => {
          console.error(error)
        },
      ),
      // Subscribe to updates to the reply reference object
      // this.projectStore.repliesById.subscribe(
      //   repliesById => {
      //     this.repliesById = repliesById
      //   },
      //   error => {
      //     console.error(error)
      //   },
      // ),
    )

    // Subscribe to Heat Vision toggle updates
    this.subscriptions.push(
      this._socket.heatVisionUpdates.subscribe(heatToggle => {
        this.project.heat_vision = heatToggle.heatVision.all
      }),
    )
  }

  /**
   * Filters and sorts comments based on set parameters
   * @todo support using URL params
   * @param sort optional - ordering parameter
   */
  public filterComments(sort?: string) {
    if (!sort) {
      sort = this.sortValue
    }
    let sorted
    if (this.comment && this.comment.lineY) {
      this.filterMode = 'line'
      this.sortValue = sort = 'location'
      sorted = this.commentByPos[this.comment.lineY].slice().filter(comment => {
        return comment.start >= 0
      })
    } else {
      this.filterMode = 'all'
      sorted = this.allComments.slice().filter(comment => {
        return comment.start >= 0
      })
    }

    if (sort === 'location') {
      this.comments = sorted.sort(function(a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return a.start - b.start
      })
    } else {
      // 'created' / default
      this.comments = sorted.sort(function(a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
      })
    }

    this.commentCount = this.comments.length
  }

  /**
   * Clear filters applied to the explorer
   * @note does not fire "filterComments", so it can be used internally
   */
  private clearFilters(): void {
    this.sortValue = 'created'
    this.filterMode = 'all'
    this.comment = null
  }

  /**
   * Reset comment explorer to "all comments"
   */
  viewAll(): void {
    this.clearFilters()
    this.filterComments()
    /**
     * Return scroll to the top
     * @todo only scroll on filter click
     */
    this.scrollable && this.visible && this.scrollable.scrollTo({ top: 0, duration: 0 })
  }

  dismissCommentPane() {
    console.log('Dismiss!')
    this.visible = false
    this.comment = null
    // this.comment.selected = false
    // if (this.reply) {
    //   this.reply.selected = false
    // }
    this.close.emit(false)
    document.body.classList.remove('body__lock-scroll')
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
    document.body.classList.remove('body__lock-scroll')
  }

  /**
   * Evaluate conditions for scrolling to a comment
   */
  evaluateShouldScroll(): void {
    if (!this.visible) {
      return
    }
    // if the comment is new, let's adjust the scroll position if there are a ton of comments
    // + Verify reply changes first, in order to support transitioning from comment => reply
    // if (this.reply.new) {
    //   this.scrollToComment(this.reply, true)
    // } else if (this.comment.new) {
    //   this.scrollToComment(this.comment)
    // }
    // // if the comment was selected then we'll need to scroll to it, but not activate it
    // if (this.reply.selected) {
    //   this.scrollToComment(this.reply, true)
    // } else if (this.comment.selected) {
    //   this.scrollToComment(this.comment)
    // }
  }

  /**
   * Scroll to Comment
   * @param targetComment Comment to scroll to
   */
  scrollToComment(targetComment: EdjiComment, isReply?: boolean) {
    if (isReply) {
      // Tell parent comment to display replies
      this.commentReplyEmitter(this.comment, true)
    }
    setTimeout(() => {
      let commentEl = document.getElementById('comment-' + targetComment._id)
      // Found comment, scroll!
      if (commentEl && commentEl.scrollIntoView) {
        commentEl.scrollIntoView()
        // Offset for comment pane sticky header (60px) and nav bar (70px), and a lil padding
        if (!isReply) {
          // this.commentPane.nativeElement.scrollTop -= 150
        }
      }
    }, 1)
  }

  commentActivationEmitter(shouldActivate, comment?: any) {
    let wordIndex = comment.start
    let commentsByIndex = this.projectStore.commentsByIndex

    let commentIndex = 0

    if (shouldActivate) {
      let commentsByIndexL = commentsByIndex[wordIndex] ? commentsByIndex[wordIndex].length : 0
      for (let i = 0; i < commentsByIndexL; i++) {
        if (commentsByIndex[wordIndex][i]._id === comment._id) {
          commentIndex = i
          break
        }
      }

      if (comment && comment.type === 'emoji') {
        this.scrollToComment(comment)
      }
    }
  }

  commentUpdatedEmitter() {
    // this.commentUpdated.emit()
  }

  /**
   * Toggle replies on parent comment
   * @param comment Parent Comment
   */
  commentReplyEmitter(comment: EdjiComment, forceShow?: boolean): void {
    // this.repliesToggleById[comment._id] = forceShow || !this.repliesToggleById[comment._id]
  }

  // /**
  //  * Create a Comment of any Type
  //  * - Fired from comment options tooltip
  //  * Requires three parameters, and finds the other information it needs
  //  * @param type What kind of reply comment: emoji, text...
  //  */
  // addReplyOfType(comment: EdjiComment, type: string): void {
  //   let commentId = comment._id

  //   this.angulartics.eventTrack.next({
  //     action: type + 'ReplyCreate',
  //     properties: { category: 'heroFeature', label: 'attempt' },
  //   })

  //   var replyCommentNew = <EdjiComment>{
  //     user_id: this.user._id,
  //     author: this.user.fullname,
  //     reply_to: commentId,
  //     data: '',
  //     type: type,
  //   }

  //   replyCommentNew.new = true
  //   // replyCommentNew.active = true
  //   // this.replyCommentNew = replyCommentNew

  //   if (type == 'emoji') {
  //     // this.activeEmojiKeyboardReply(this.replyCommentNew)
  //   }

  //   // Tell the server we've added a comment.
  //   // this.projectStore
  //   //   .saveComment(this.replyCommentNew)
  //   //   .then(comment => {
  //   //     this.angulartics.eventTrack.next({
  //   //       action: type + 'ReplyCreate',
  //   //       properties: { category: 'heroFeature', label: 'success' },
  //   //     })
  //   //     comment.active = true
  //   //     this._comments.activeComment = comment
  //   //     this.projectStore.addCommentToReplies(comment)
  //   //   })
  //   //   .catch(error => {
  //   //     // TRACK EXCEPTION
  //   //     this.angulartics.eventTrack.next({
  //   //       action: type + 'ReplyCreate',
  //   //       properties: { category: 'heroFeature', label: 'failure' },
  //   //     })
  //   //     console.log(error)
  //   //   })
  // } // createReplyComment(type: string): void
}
