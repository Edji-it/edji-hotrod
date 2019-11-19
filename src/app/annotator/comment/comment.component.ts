import { Subscription } from 'rxjs'
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChange } from '@angular/core'

// Project Dependencies
import { AuthService, CommentService, SocketService } from '../../_services'
import { EdjiComment, CommentPermissions, EdjiQuestion } from './../../shared/datatypes'
import { ALLSPARK } from './../../app.constants'
import { ProjectStore } from 'src/app/_store'

@Component({
  selector: 'edji-comment',
  templateUrl: './comment.component.pug',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit, OnDestroy {
  public lineCount: number = 1
  public indexOnLine: number = 1
  public repliesShowing: boolean = false
  public isImageSpot: boolean = false

  private justSaved: boolean = false
  private isLoading: boolean = false
  // Hold the current scroll position for the iOS fix
  private currentScroll: number
  // Is fully visible, focused, and editable
  private active: boolean = false
  private showDeleteModal: boolean = false
  private user: any
  private subscriptions: Subscription[] = []
  private repliesById: any = {}
  private commentsByPos: any = []
  private project: any
  private commentPane: boolean
  private indicatesPane: boolean
  private setLineYAttempts: number = 0
  private fragment: string

  @Input() public comment: EdjiComment
  @Input() private readOnly: boolean = false
  @Input() private replyRef: boolean = false
  @Input() public reply: boolean = false // Is it a reply to another comment?
  @Input() private commentLite: boolean = false
  @Input() private commentContext: string = 'comment' // See NOTES in summary.
  @Input() public commentMobile: boolean = false
  @Input() public commentMobileFirst: boolean = false
  @Input() public commentPaneActive: boolean = false
  @Input() private assignedQuestion: EdjiQuestion // If this is an answer, it'll need this.
  @Input() private userPermission: number = CommentPermissions.READ
  @Input() private showDeleteAudioModal: boolean = false
  @Input() public readingReport: boolean = false
  @Input()
  set isActive(isActive: boolean) {
    if (typeof isActive !== 'undefined' && this.active !== isActive) {
      this.active = isActive
      if (!isActive) {
        // Trigger save when deactivated externally i.e. emoji keyboard
        this.deactivate(this.comment)
      } else {
        this.toggleCPane(this.comment, true)
      }
    }
  }
  get isActive(): boolean {
    return this.active
  }

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
    private projectStore: ProjectStore,
    private _comments: CommentService,
    private _auth: AuthService,
    public el: ElementRef,
    private _socket: SocketService,
  ) {}

  ngOnInit() {
    // Set initial values if passed
    if (!this.reply) {
      if (this.comment.lineCount) {
        this.lineCount = this.comment.lineCount
      }
    }
    // Identify if it's an image spot comment
    if (this.comment.loc && typeof this.comment.loc.x == 'number' && !this.comment.text && !this.comment.box) {
      this.isImageSpot = true
    }

    /** Set the current user every time it changes */
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
      }),
    )

    // Subscribe to updates to the reply reference object
    this.subscriptions.push(
      this.projectStore.repliesById.subscribe(
        repliesById => {
          this.repliesById = repliesById
        },
        error => {
          console.error(error)
        },
      ),
    )

    // Subscribe to updates from that project once we're subscribed to the reading
    this.subscriptions.push(
      this.projectStore.currentProject.subscribe(
        project => {
          if (project) {
            this.project = project
            this.setAuthorOwner(project)
          }
        },
        error => {
          console.error(error)
        },
      ),
    )

    // Certain events require a top-down decision to deactivate comments
    this.subscriptions.push(
      this._comments.clearActiveComments.subscribe(
        deactivate => {
          this.deactivate()
        },
        error => {
          console.error(error)
        },
      ),
    )

    this.subscriptions.push(
      this.projectStore.commentByPos.subscribe(commentsByPos => {
        this.commentsByPos = commentsByPos
        this.updateLineCount()
      }),
    )
  }

  /**
   * Set display flag for Teachers/Owners/Co-Owners
   * @description provides reset when co-owners change, and handles live comments
   * @param project
   */
  private setAuthorOwner(project): void {
    if (
      this.comment.user_id === project.teacher_id ||
      (project.co_owner_ids && project.co_owner_ids.indexOf(this.comment.user_id) > -1)
    ) {
      this.comment.authorIsTeacher = true
    } else {
      this.comment.authorIsTeacher = false
    }
  }

  /**
   * Get nearest baseline as integer
   * @param vYalue: number The y position in pixels
   * @returns number Nearest baseline Y value
   */
  private nearestLine(yValue: number): number {
    return yValue + ALLSPARK.BASELINEHEIGHT / 2 - (yValue % ALLSPARK.BASELINEHEIGHT)
  }

  /**
   * Calculates lineY and imageY values for rendering
   * - lineY is required by commentByPos in ProjectService
   * - imageY provides consistent and lighter comment positioning on images
   */
  setLineY() {
    let firstWord = document.querySelector('.w[index="1"]')
    // @todo Workaround: Identify back up firstWord (index 1 is more reliably a word)
    if (!firstWord) {
      firstWord = document.querySelector('.w[index="0"]')
    }
    let commentWord = document.querySelector('.w[index="' + this.comment.start + '"]')
    let commentImage = document.getElementById('readingImage' + this.comment.start)

    if (firstWord && (commentWord || commentImage)) {
      let firstWordTop: number = firstWord.getBoundingClientRect().bottom
      // This will need to re-decorate on resize
      // For a period we were erroneously saving comments on text with image coords
      // *Fixed March 2019, but allow for legacy comments by checking for commentImage
      if (commentImage && ((this.comment.loc && this.comment.loc.y) || this.comment.box)) {
        // Set comment on image position
        this.setLineYAttempts = 0
        let imageTop: number = commentImage.getBoundingClientRect().top
        let imageHeight = commentImage.clientHeight
        let y = this.comment.box ? this.comment.box.start_y : this.comment.loc.y
        // Get nearest baseline (Y) of comment within image
        let imageY = (y / 100) * imageHeight
        this.comment.imageY = imageY = this.nearestLine(imageY)

        // Get image offset for Line Y value
        let imageOffset = imageTop - firstWordTop
        imageOffset = this.nearestLine(imageOffset)
        this.comment.lineY = imageY + imageOffset
      } else {
        // Set comment on text position
        let wordY = commentWord.getBoundingClientRect().bottom
        wordY = wordY - firstWordTop
        this.comment.lineY = this.nearestLine(wordY)
      }
    } else {
      this.setLineYAttempts++
      if (this.setLineYAttempts < 10) {
        setTimeout(() => {
          this.setLineY()
        }, 1000)
      } else {
        // Reset attempt count once we've tried 10 times
        this.setLineYAttempts = 0
      }
    }
  }

  activate(event?: any): void {
    // Deactivate any active comments
    this._comments.deactivateAllComments()
    // Activate this comment
    this.comment.active = this.active = true
    this._comments.activeComment = this.comment
    this.commentActivation.emit(true)
  }

  /**
   * Deactivates/unfocuses comment, and optionally triggers save
   * @param comment (optional) Full EdjiComment object
   */
  deactivate(comment?: any, noUpdate?: boolean): void {
    // Deactivate this comment
    this.comment.active = this.active = false
    this.comment.new = false
    this.commentActivation.emit(false)
    this._comments.activeComment.active = false
    // Save when comment is toggled away from
    if (comment && !noUpdate) {
      this.updateComment(comment)
    }
  } // deactivate()

  /**
   * Saves updates to comments
   * @param comment Full EdjiComment object
   */
  public updateComment(comment: EdjiComment): void {
    if (comment._id) {
      // this.comment.project_id, comment, this.comment.start, this.comment.end, this.comment.type, this.comment.text, this.comment._id, this.comment.loc
      this.comment.data = comment.data
      this.comment.url = comment.url
    } else {
      this.comment.data = comment
    } // else

    if (this.commentContext !== 'answer') {
      if (this.commentContext === 'reply') {
        // If this is a reply comment
        this.isLoading = true
        this.projectStore.addCommentToReplies(this.comment)
      } else {
        // If it is a regular comment.
        this.isLoading = true
      } // else
      this.projectStore
        .saveComment(this.comment)
        .then(comment => {
          this.isLoading = false
          this.commentUpdated.emit()

          // let the student that made the comment know there is a reply
          if (this.commentContext === 'reply') {
            this._socket.groupUpdateEvent({
              type: 'replyUpdate',
              reply: this.comment,
              pComment: this.comment.reply_to,
            })
          }

          this.justSaved = true
          setTimeout(() => {
            this.justSaved = false
            // this.comment.active = false
          }, 1000)
        })
        .catch(error => {
          console.error(error)
        })
    } else {
      this.isLoading = true
      this.projectStore.addAnswerToAnswers(this.comment)
      this.projectStore
        .saveAnswer(this.comment)
        .then(answer => {
          this.isLoading = false

          this.commentUpdated.emit()
          this.projectStore.addAnswerToAnswers(answer)

          this.justSaved = true
          setTimeout(() => {
            this.justSaved = false
            // this.comment.active = false
          }, 1000)
        })
        .catch(error => {
          console.error(error)
        })
    }
  } // public updateComment(comment: any, reply ?: boolean): void

  // Deletes comment via Project service, which updates the local Project object
  public deleteComment(comment: any): void {
    if (this.commentContext !== 'answer') {
      this.projectStore
        .removeComment(comment)
        .then(data => {
          // Tell Annotator to destroy this comment element!
          this.showDeleteModal = false
        })
        .catch(error => {
          this.deactivate(this.comment)
          console.error(error)
        })
    } else {
      this.projectStore
        .removeAnswer(comment)
        .then(data => {
          this.projectStore.removeAnswerFromAnswers(this.comment)
          this.showDeleteModal = false
        })
        .catch(error => {
          this.deactivate(this.comment)
          console.error(error)
        })
    }
  } // deleteComment(comment: any) : void

  /**
   * Display text for "Replies" button
   */
  public replyBtnText(): string {
    let replies = this.repliesById[this.comment._id]
    let btnText = 'Reply'

    if (replies) {
      let repliesCount = replies.length
      if (repliesCount == 1) {
        btnText = repliesCount + ' Reply'
      } else if (repliesCount > 1) {
        btnText = repliesCount + ' Replies'
      }
    }

    return btnText
  }

  /**
   * Determine if comment has replies
   */
  public hasReplies(comment): boolean {
    return this.repliesById[comment._id] && this.repliesById[comment._id].length > 0
  }

  /**
   * Toggle display of replies
   * @description Uses output to trigger display in parent component
   */
  public toggleReplies(): void {
    this.repliesShowing = !this.repliesShowing
    this.commentReply.emit(this.comment)
  }

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
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  toggleCPane(comment?, forceOpen?: boolean): void {
    // When displaying in comment pane, comment MUST have line y
    if (!this.comment.lineY) {
      this.setLineY()
      this.projectStore.buildCommentsByPos()
    }
    if (!this.commentPaneActive) {
      if (comment.selected) {
        this.comment.selected = true
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
      for (let i = 0; i < this.lineCount; i++) {
        if (commentsOnLine[i]._id == this.comment._id) {
          this.indexOnLine = this.lineCount - i
        }
      }
    } else {
      this.lineCount = 1
    }
  }

  /**
   * Returns true if comment is a fresh, empty comment
   * @param comment EdjiComment in question
   */
  isCommentNewDraft(comment: EdjiComment): boolean {
    return (!comment.data || comment.data == '') && (!comment.url || comment.url == '')
  }

  public getOffset(el) {
    el = el.getBoundingClientRect()
    return {
      left: el.left + window.scrollX,
      top: el.top + window.scrollY,
    }
  }

  public scrollToImage(imageIndex) {
    let yOffset = 100
    let imageElement = document.getElementById('readingImage' + imageIndex)
    if (!imageElement) {
      this.projectStore.lastWordUpdateSubj.next(imageIndex)
      setTimeout(() => {
        this.scrollToImage(imageIndex)
      }, 1)
    } else {
      let yPos = this.getOffset(imageElement).top
      window.scrollTo(0, yPos - yOffset)
    }
  }

}
