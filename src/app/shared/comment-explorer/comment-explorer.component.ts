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

  // Search
  public searchTerm: string = ''
  public appliedTerm: string = ''

  // Sort and Filtering
  public sortValue: SearchSort = 'created' // default to created
  public filterMode: SearchFilter = 'all'
  public filterUserId: string
  public filterCurrentUser: boolean

  // Display
  public loading: boolean

  // Comment Pane Component Inputs
  private _comment: EdjiComment
  @Input()
  set comment(comment: EdjiComment) {
    let commentApplied: boolean
    if (!this._comment || (comment && comment._id !== this._comment._id)) {
      commentApplied = true
    }
    this._comment = comment
    if (commentApplied) {
      this.filterComments()
      this.evaluateShouldScroll()
    }
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
  @Output() clearSelected = new EventEmitter()

  @ViewChild(NgScrollbar, { static: true }) scrollable: NgScrollbar
  @ViewChild('searchInput', { static: false }) searchInput

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
          /**
           * Ensure we update explorer when:
           *  - line is re-evaluated for a new comment
           *  - New comment added via sockets
           */
          if ((this.comment && this.comment.new) || this.filterMode === 'all') {
            this.filterComments({ update: true })
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
            this.filterComments({ update: true })
          }
        },
        error => {
          console.error(error)
        },
      ),
      // Subscribe to Heat Vision toggle updates
      this._socket.heatVisionUpdates.subscribe(heatToggle => {
        this.project.heat_vision = heatToggle.heatVision.all
        this.filterComments({ update: true })
      }),
      // Check for filters on URL
      this.route.queryParams.subscribe(params => {
        // Apply sort
        if (params['sort']) this.sortValue = params['sort']
        // Detect search/filter modes
        if (params['search']) {
          this.searchTerm = params['search']
          this.sortValue = params['sort'] || 'match'
          this.filterComments()
          this._visible = true
        } else if (params['student']) {
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
   * Search logic
   * - Provides client-side fuzziness, relevancy, and exact matches
   * @param comment
   * @param term
   */
  searchComment(comment: EdjiComment, term: string): boolean {
    // Reset search score
    comment.search_score = 0
    /**
     * Search Algorithm
     * - Weights exact matches as 1.0, fuzzy matches as <1
     * - Attaches search score to comments for sorting (relies on comment pointer)
     * - Finds only exact matches for quote wrapped terms
     * @param string Content to search
     * @param words Search term broken apart
     * @param ratio how fuzzy to allow (0.1 - 1.0)
     */
    function fuzzy(string, words: { str: string; exact?: boolean }[], ratio) {
      let score = 0
      string = string.toLowerCase() || ''
      for (let i = 0; i < words.length; i++) {
        let w = words[i]
        let len = w.str.length
        if (new RegExp(`\\b${w.str}|${w.str}\\b`).test(string)) {
          // Partial matches, checking for word boundaries
          score += 1
        } else if (len >= 5 && !w.exact) {
          // Fuzzy search for longer words
          var matches = 0
          for (var j = 0; j < len; j++) {
            // check for pairs of letters
            let pair = w.str[j] + (w.str[j + 1] || '')
            string.indexOf(pair) > -1 ? (matches += 1) : (matches -= 1)
          }
          // Reduce fuzzy value if string is long (value of match scales)
          let fscore = matches / (string.length * 0.5)
          // Max value of 1
          if (fscore > 0) score += fscore
          else score -= 1
        } else {
          // Reduce score if word is not found
          score -= 1
        }
      }
      // Save for sorting
      if (score >= 0) comment.search_score = score
      return score >= ratio || term == ''
    }
    // Process the search term once
    let quoteWrapped = /^(").*(")$/
    let terms = term.split(/(".*")|\s/)
    let words = []
    terms.forEach(word => {
      if (!word) return
      // Lower case and escape special characters
      word = word.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      if (quoteWrapped.test(word)) {
        let unwrappedTerm = word.substring(1, word.length - 1)
        words.push({ str: unwrappedTerm, exact: true })
      } else {
        words.push({ str: word })
      }
    })
    let commentMatch = comment.data && fuzzy(comment.data, words, 0.2)
    // Since we don't expect typos in the content, reduce fuzzy matches (see ratio)
    let contentMatch = comment.text && fuzzy(comment.text, words, 0.75)
    return contentMatch || commentMatch
  }

  /**
   * Filters and sorts comments based on set parameters
   * @todo support using URL params
   * @param sort optional - ordering parameter
   */
  public filterComments(opts?: { sort?: string; update?: boolean }) {
    if (!opts) {
      opts = {}
    }
    let sort = opts.sort || this.sortValue
    let sorted: EdjiComment[] = this.allComments.slice()
    let comment = this.comment
    // Set loading state
    if (!opts.update) {
      this.loading = true
      this.scrollable && this.visible && this.scrollable.scrollTo({ top: 0, duration: 0 })
    }
    // Apply Heat Vision
    if (!this.project.heat_vision && !this.project.isTeaching) {
      sorted = sorted.filter(c => {
        return c.user_id === this.user._id
      })
    }
    // Handle if reply selected
    if (comment && comment.reply_to) {
      comment = sorted.find(c => {
        return c._id === comment.reply_to
      })
    }
    if (this.searchTerm) {
      sorted = sorted.filter(comment => {
        return this.searchComment(comment, this.searchTerm)
      })
      this.filterMode = 'search'
    } else if (comment && comment.lineY && this.commentByPos && this.commentByPos[comment.lineY]) {
      this.filterMode = 'line'
      this.sortValue = sort = 'location'
      sorted = this.commentByPos[comment.lineY].filter(comment => {
        return comment.start >= 0
      })
    } else if (this.filterUserId) {
      this.filterMode = 'user'
      this.filterCurrentUser = this.user._id === this.filterUserId
      sorted = sorted.filter(comment => {
        return comment.user_id === this.filterUserId
      })
    } else {
      this.filterMode = 'all'
      sorted = sorted.filter(comment => {
        // This hides replies from All Comments feed
        return comment.start >= 0
      })
    }

    if (sort === 'match' && this.searchTerm) {
      sorted = sorted.sort(function(a, b) {
        return b.search_score - a.search_score
      })
    } else if (sort === 'location') {
      sorted = sorted.sort(function(a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return a.start - b.start
      })
    } else {
      // 'created' / default
      sorted = sorted.sort(function(a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
      })
    }

    this.appliedTerm = this.searchTerm || ''
    this.commentCount = sorted.length
    this.comments = sorted
    setTimeout(() => {
      this.loading = false
    }, 400)
  }

  /**
   * Clear filters applied to the explorer
   * @note does not fire "filterComments", so it can be used internally
   */
  private clearFilters(paramsToKeep?: { line?: string; student?: string }): void {
    this.filterMode = 'all' //- default
    if (!paramsToKeep) paramsToKeep = {}
    paramsToKeep['pane'] = 'comments'
    if (!paramsToKeep['student']) this.filterUserId = null
    if (!paramsToKeep['line']) this.comment = null
    if (!paramsToKeep['search']) this.searchTerm = null
    if (!paramsToKeep['sort']) this.sortValue = 'created'
    // Tell parent component comment is cleared
    this.clearSelected.emit()
    // Merge params to keep with reset/null
    let params = Object.assign({ student: null, line: null, search: null, sort: null }, paramsToKeep)
    // Clear URL params
    this.router.navigate(['./'], {
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
    /**
     * Return scroll to the top
     */
    this.scrollable && this.visible && this.scrollable.scrollTo({ top: 0, duration: 0 })
  }

  /**
   * Search comments
   */
  viewSearch(): void {
    this.filterMode = 'search'
    this.sortValue = 'match'
    this.scrollable && this.visible && this.scrollable.scrollTo({ top: 0, duration: 0 })
    this.searchInput && this.searchInput.nativeElement.focus()
  }

  /**
   * Apply search term
   */
  applySearch(): void {
    if (this.searchTerm) {
      this.router.navigate(['./'], {
        relativeTo: this.route,
        queryParams: { search: this.searchTerm, sort: this.sortValue },
        queryParamsHandling: 'merge',
      })
    } else {
      this.filterComments()
      this.viewSearch()
    }
  }

  /**
   * Apply sort filter
   */
  applySort(sort?: SearchSort) {
    this.router.navigate(['./'], {
      relativeTo: this.route,
      queryParams: { sort: sort },
      queryParamsHandling: 'merge',
    })
  }

  close() {
    this.visible = false
    this.comment = null
    this.filterUserId = ''
    this.closed.emit(false)
    document.body.classList.remove('body__lock-scroll')
    // Clear URL params
    this.router.navigate(['./'], {
      relativeTo: this.route,
      queryParams: { pane: null, student: null, line: null, sort: null, search: null },
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
    if (this.comment) {
      this.scrollToComment(this.comment)
    }
  }

  /**
   * Scroll to Comment
   * @param targetComment Comment to scroll to
   * @note We check "visible" before scrolling since content is required
   * - it is also possible to check this.scrollable.viewport (the reason it fails)
   */
  scrollToComment(targetComment: EdjiComment, isReply?: boolean) {
    // Replies are opened by comment component based on URL param
    setTimeout(() => {
      let commentEl = document.getElementById('comment-' + targetComment._id)
      // Found comment, scroll!
      if (commentEl) {
        this.scrollable &&
          this.visible &&
          this.scrollable.scrollToElement(commentEl, { top: 0, left: -100, duration: 400 })
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

  /**
   * Apply Student Filter
   * @param student User needs "_id" and "fullname"/"username"
   */
  public viewStudentFilter(studentId: any): void {
    this.projectStore.filterByUser(studentId)
  }

  /**
   * Track by function
   * @param index item index
   * @param comment iterated comment
   */
  trackComment(index, comment): string {
    return comment._id
  }
}

type SearchSort = 'created' | 'location' | 'match'
type SearchFilter = 'line' | 'all' | 'user' | 'search'
