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
import { Router, ActivationEnd, ActivatedRoute } from '@angular/router'
@Component({
  selector: 'comment-explorer',
  templateUrl: './comment-explorer.component.pug',
  styleUrls: ['./comment-explorer.component.scss'],
})
export class CommentExplorerComponent implements OnInit, OnDestroy {
  // // Is fully visible, focused, and editable
  public active = false
  public selected = false
  public user: User
  public project: Project = <Project>{}

  // // Subscriptions and related
  public subscriptions: Subscription[] = []
  private allComments: EdjiComment[] = []
  public comments: EdjiComment[] = []
  public commentCount: number = 0
  public commentByPos: any[] = []

  // Sort and Filtering
  public sortValue: string = 'created' // default to created

  public filterMode: 'line' | 'all' | 'user' = 'all'
  public filterUserId: string

  // Comment Pane Component Inputs
  private _comment: EdjiComment
  @Input()
  set comment(comment: EdjiComment) {
    if (!this._comment || (comment && comment._id !== this._comment._id)) {
      this.evaluateShouldScroll()
    }
    this._comment = comment
  }
  get comment(): EdjiComment {
    return this._comment
  }

  private _visible: boolean
  @Input()
  set visible(visible: boolean) {
    let madeVisible: boolean = visible !== this._visible && visible
    this._visible = visible
    if (madeVisible) {
      this.filterComments()
      this.evaluateShouldScroll()
      document.body.classList.add('body__lock-scroll')
    }
    if (!visible) {
      document.body.classList.remove('body__lock-scroll')
    }
  }
  get visible(): boolean {
    return this._visible
  }

  // Comment Pane Component Outputs
  @Output() closed = new EventEmitter()

  @ViewChild(NgScrollbar, { static: true }) scrollable: NgScrollbar

  constructor(
    private projectStore: ProjectStore,
    private _socket: SocketService,
    public el: ElementRef,
    private _auth: AuthService,
    private _comments: CommentService,
    private angulartics: Angulartics2,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // Subscribe to updates to the comment by line number position array
    this.subscriptions.push(
      this.projectStore.commentByPos.subscribe(
        commentByPos => {
          this.commentByPos = commentByPos
          // Ensure we update explorer when line is re-evaluated for a new comment
          if (this.comment && this.comment.new) {
            this.filterComments()
          }
        },
        error => {
          console.error(error)
        },
      ),
      /** Set the current user every time it changes */
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
      // Subscribe to Heat Vision toggle updates
      this._socket.heatVisionUpdates.subscribe(heatToggle => {
        this.project.heat_vision = heatToggle.heatVision.all
      }),
      // Check for filters on URL
      this.route.queryParams.subscribe(params => {
        if (params['student'] && this.filterUserId !== params['student']) {
          this.clearFilters({ student: params['student'] })
          this.filterUserId = params['student']
          this.filterComments()
          this._visible = true
        } else if (params['pane'] && params['pane'] === 'comments') {
          this.filterComments()
          this._visible = true
        } else if (this.visible) {
          this.close()
        } else {
          this.closed.emit(false)
        }
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
    let comment = this.comment
    // Handle if reply selected
    if (comment && comment.reply_to) {
      comment = this.allComments.find(c => {
        return c._id === comment.reply_to
      })
    }
    if (comment && comment.lineY && this.commentByPos && this.commentByPos[comment.lineY]) {
      this.filterMode = 'line'
      this.sortValue = sort = 'location'
      sorted = this.commentByPos[comment.lineY].filter(comment => {
        return comment.start >= 0
      })
    } else if (this.filterUserId) {
      this.filterMode = 'user'
      sorted = this.allComments.filter(comment => {
        return comment.user_id === this.filterUserId
      })
    } else {
      this.filterMode = 'all'
      sorted = this.allComments.filter(comment => {
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
  private clearFilters(paramsToKeep?: { comment?: string; parent?: string; student?: string }): void {
    this.sortValue = 'created'
    this.filterMode = 'all' //- default
    if (!paramsToKeep) paramsToKeep = {}
    paramsToKeep['pane'] = 'comments'
    if (!paramsToKeep['comment']) this.comment = null
    if (!paramsToKeep['student']) this.filterUserId = null
    // Merge params to keep with reset/null
    let params = Object.assign({ comment: null, parent: null, student: null }, paramsToKeep)
    // Clear URL params
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    })
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

  close() {
    this.visible = false
    this.comment = null
    this.filterUserId = ''
    this.closed.emit(false)
    document.body.classList.remove('body__lock-scroll')
    // Clear URL params
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { pane: null, student: null, comment: null, parent: null },
      queryParamsHandling: 'merge',
    })
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
    if (this.comment && this.comment.selected) {
      this.scrollToComment(this.comment)
    }
  }

  /**
   * Scroll to Comment
   * @param targetComment Comment to scroll to
   */
  scrollToComment(targetComment: EdjiComment, isReply?: boolean) {
    // Replies are opened by comment component based on URL param
    setTimeout(() => {
      let commentEl = document.getElementById('comment-' + targetComment._id)
      // Found comment, scroll!
      if (commentEl) {
        this.scrollable &&
          this.visible &&
          this.scrollable.scrollToElement(commentEl, { top: 100, left: -100, duration: 400 })
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

  /**
   * Delete comment handler
   * - If only comment, close pane
   */
  public onDelete(): void {
    if (this.comments.length <= 1) {
      this.close()
    }
  }
}
