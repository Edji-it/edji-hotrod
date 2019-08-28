import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  HostListener,
  ViewChild,
  AfterViewInit,
} from '@angular/core'
import { Subject, Subscription } from 'rxjs'
import * as Rangy from 'rangy'
import { Angulartics2 } from 'angulartics2'
import { Location } from '@angular/common'

// Project Dependencies
import { CommentComponent } from './comment/comment.component'
import {
  AudioService,
  AuthService,
  CommentService,
  ProjectService,
  ReadingService,
  SocketService,
  UtilToolService,
  MessageService,
  AcademyService,
} from '../_services'
import { CommentPermissions, EdjiComment, Project, Reading, Feedback } from './../shared/datatypes'
import { ALLSPARK } from '../app.constants'
import { ActivatedRoute, Router } from '@angular/router'
import { TeacherFeedbackComponent } from './teacher-feedback/teacher-feedback.component'

@Component({
  selector: 'annotator',
  templateUrl: './annotator.component.pug',
  styleUrls: ['annotator.component.scss'],
})
export class AnnotatorComponent implements OnInit, OnDestroy, AfterViewInit {
  /*
        Annotator Component
        Last Mod: 5 Aug 2017 - Josh Kyburz

        This does all the heavy lifting in a a reading.
        - Loads Reading text
        - Compiles word components
        - Triggers highlighting
        - Deletes highlights and comment components
        - Asks ProjectService to save comments for us.
    */

  @Input() private mobileCommentActive: boolean
  @Input() private activeReply: any

  @ViewChildren(CommentComponent) commentComponents: QueryList<CommentComponent>
  @ViewChildren('words') wordEls
  @ViewChild('activeContent', { static: false }) contentEl: ElementRef
  @ViewChildren(TeacherFeedbackComponent) feedbackEl: QueryList<TeacherFeedbackComponent>

  public reading: Reading = <Reading>{}
  public project: Project = <Project>{}
  // Feedback for current user
  public feedbackForUser: Feedback[] = []
  public paneCommentComponentUpdates: CommentComponent[]
  // Determines when infinite scroll should begin
  public lastWord: number = 4000
  public lastWordImageOffset: number = 100
  // Used to calculate max/progress for reading progress bar
  public currentDocHeight: number = 0
  public currentScroll: number = 0

  public commentsByIndex: EdjiComment[][] = []
  public focusOverride: boolean = false

  // Indices highlighted by users other than owner or current user
  public highlightArray: number[] | number[][] = []
  // Indices highlighted by current user or reading owner
  public alwaysHighlightArray: number[][] = []
  // Indices for highlights of a selected filter
  public filterHighlightArray: number[][]
  public focusArray: (boolean | boolean[])[] = []
  // Word/Hit boxes on images
  /**
   * @todo add layered highlighting to boxes
   */
  // public boxHighlightArray: number[][]
  // public boxAlwaysHighlightArray: number[][]
  // public boxFilterHighlightArray: number[][]

  // Line Count
  public lineCountRunning: boolean = false
  public lineNumRunning: boolean
  public commentPane: boolean
  public lineExpanded: number

  // public activeComment: EdjiComment = <EdjiComment>{}
  public replyComment: EdjiComment = <EdjiComment>{}
  public selectedComment: EdjiComment = <EdjiComment>{}
  public selectedReply: EdjiComment = <EdjiComment>{}
  // Comment options that can be made directly on a word
  public directCommentOptions: string[] = []

  // Trigger Booleans
  public showDiscussions: boolean = false
  public optionsShow = false
  public hideKeyboard = false

  // Status Booleans
  public isMobile = false
  private commentFragScrollReady = false

  public highlightY = 200
  public highlightX = 20
  public optionLeft = true
  public mobileIndex = 0
  public commentHeightPos = 0
  private renderTimeout = 3000

  public imageCoords: { x?: number; y?: number } = {}
  public imageHotspotPlaceholder: any = {
    index: -1,
    x: 0,
    y: 0,
    focus: false,
    preview: false,
  }
  public imageHeight: number[] = []

  public subscriptions: Subscription[] = []

  // For converting old Readings
  public words: any[] = []

  // For verifying comment ownership
  public user: any

  // For mobile display of comments
  public foundArray: any[] = []

  public guideContent = [
    {
      title: 'Try Highlighting!',
      image: '/assets/guide/add-highlight-v2.gif',
      body: 'Select text by clicking 1 or 2 words. Or click on an image to place a dot!',
    },
    {
      title: 'Add a Comment!',
      image: '/assets/guide/add-comment-type-v2.gif',
      body: 'Choose the type of comment you want to make to create your highlight.',
    },
    {
      title: 'Who sees my comment?',
      // image: "/assets/guide/add-comment-type.gif",
      body: 'Your comment can be seen by the teacher. If they turn Heat Vision on, everyone can see it!',
    },
  ]
  public guideStepNo = 1

  public annotatorPaper: Element
  public annotatorContent: Element

  public window: any
  public audioSupportError: boolean = false

  public quickSelect: { anchor: number; focus: number; boxes?: { word: number; start: number; end?: number } } = {
    anchor: null,
    focus: null,
    boxes: null,
  }

  // For debouncing/wait on showCommentOptions
  private showCommentOptionsWait: boolean = false

  // HostListener debouncers
  private debounceStatus: { mousemove?: boolean; scroll?: boolean } = {}

  constructor(
    private element: ElementRef,
    private _readings: ReadingService,
    private _projects: ProjectService,
    private _auth: AuthService,
    private _socket: SocketService,
    private _util: UtilToolService,
    public _comments: CommentService,
    private angulartics: Angulartics2,
    private _audio: AudioService,
    private _messages: MessageService,
    private route: ActivatedRoute,
    private _router: Router,
    private _academy: AcademyService,
    private location: Location,
  ) {
    this.window = window
  }

  /**
   * Simple debounce for Hostlisteners
   * @param descriptor function or event name
   * @param delay time in ms to debounce
   * @returns debounced boolean (true = ignore event)
   */
  private debounce(descriptor: string, delay: number): boolean {
    if (this.debounceStatus[descriptor]) {
      return true
    } else {
      this.debounceStatus[descriptor] = true
      setTimeout(() => {
        this.debounceStatus[descriptor] = false
      }, delay)
      return false
    }
  }

  /**
   * This renders the next 400 words whenever the window gets a certain amount away from the bottom of the view,
   *  which is determined by distanceFromViewport
   */
  @HostListener('window:scroll', ['$event'])
  scrollUpdate(event) {
    if (!this.debounce('scroll', 300)) {
      this.onScrollUpdate()
      this.currentScroll =
        (document.documentElement.scrollTop / (document.body.scrollHeight - window.innerHeight)) * 100
    }
  }

  /**
   * Handle Window Resize
   * - Content reflows impact positioning of comments and other variables we calculate
   */
  @HostListener('window:resize')
  onResize() {
    // Line counts need to be re-rendered when text reflows
    this.updateImageHeights()
    this.setLinePositions()
    // Update scroll progress on resize
    this.currentDocHeight = 0
    this.preScrollHeightUpdate()
  }

  /**
   * Track Activity
   * when the user moves the mouse, let academy service know so we can keep tracking reading ticks
   * and we also make sure they have a "live" status on the indicator
   */
  @HostListener('window:mousemove')
  refreshUserState() {
    if (!this.debounce('mousemove', 5000)) {
      this._academy.trackActivity()
    }
  }

  ngOnInit() {
    // Make sure we broadcast lastWord position out to listening components
    this._projects.lastWordUpdateSubj.next(this.lastWord)

    this.annotatorPaper = document.getElementById('emojiAnnotator')
    this.annotatorContent = document.getElementById('annotatorContent')

    this.subscriptions.push(
      // Set the current user every time it changes
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
      }),
      // Get Reading via Observable
      this._readings.currentReading.subscribe(
        reading => {
          this.reading = reading
          if (this.reading && this.reading.words && this.reading.words[0] === null) {
            this.reading.words.splice(0, 1)
          }
          this.updateMetaTags()
          if (reading.questions) {
            this.updateQuestionNumbers(reading.questions)
          }
        },
        error => {
          console.error(error)
        },
      ),
      // Get Project from project service
      this._projects.currentProject.subscribe(
        project => {
          if (project.archived) {
            this._projects.filterByUser(this.user)
          }
          if (project) {
            let initialLoad = this.project._id != project._id
            this.project = project
            this.setLinePositions()
            // Set aside feedback for current user
            if (this.project.report_evals) {
              this.setFeedback()
            }
            // Initial Load events
            if (initialLoad) {
              this.directCommentOptions = []
              // Display heat vision status on initial load
              this.showHeatVisionToast(this.project.heat_vision)
              // Set comment types
              if (this.project.types) {
                for (let i = 0; i < this.project.types.length; i++) {
                  // Ignore comment types that can't be made on a word
                  // - add other types not display in text-options to the array below
                  if (['reply'].indexOf(this.project.types[i]) < 0) {
                    this.directCommentOptions.push(this.project.types[i])
                  }
                }
                // Check if audio is supported
                if (this.project.types.indexOf('audio') > -1 && !this._audio.isSupported()) {
                  this.audioSupportError = true
                  // if audio is not supported, let analytics know
                  this.angulartics.eventTrack.next({
                    action: 'noAudioSupport',
                    properties: {
                      category: this._auth.setAnalyticEventCategory(),
                      label: this._auth.setAnalyticEventLabel(),
                    },
                  })
                }
              }
            }
          }
        },
        error => {
          console.error(error)
        },
      ),
      // Get filtered highlights for comment filters
      this._projects.filterUpdates.subscribe(filter => {
        if (filter) {
          this.filterHighlightArray = filter.filterHighlightArray
        } else {
          this.filterHighlightArray = null
        }
        // Re-evaluate comment line counts
        this._projects.buildCommentsByPos()
      }),
    )
    /** Run-once logic to initialize the comment-based arrays and stats */
    let processedCommentData = this._projects.processComments(this.project)
    this.commentsByIndex = processedCommentData.commentsByIndex
    this.alwaysHighlightArray = processedCommentData.highlightArrays.alwaysHighlightArray
    this.highlightArray = processedCommentData.highlightArrays.highlightArray

    // Subscribe to comment comment updates
    this.subscriptions.push(
      this._socket.commentUpdates.subscribe(
        commentUpdate => {
          let comment = commentUpdate.comment
          let wIndex = comment.start
          let cIndex = -1

          // Get local array index
          if (this.commentsByIndex[wIndex]) {
            // faster to cache length
            let commentsByIndexLength = this.commentsByIndex[wIndex].length
            for (var i = 0; i < commentsByIndexLength; i++) {
              let commentRef = this.commentsByIndex[wIndex][i]
              if (commentRef._id === comment._id) {
                cIndex = i
              }
            }
          }

          // If comment is updated to be empty, we consider a "DRAFT", and deleted to other users
          if (this._projects.isCommentHiddenDraft(commentUpdate.comment)) {
            commentUpdate.action = 'DELETE'
          }

          // Process different live comment updates
          if (commentUpdate.action === 'DELETE') {
            if (cIndex > -1) {
              // Remove highlights from local array
              this.decrementHighlights(
                this.user._id === comment.user_id || this.project.teacher_id == comment.user_id,
                comment.start,
                comment.end,
                comment.box,
              )
              // Make sure we've removed the highlight focus
              this.unfocusHighlight(comment.start, comment.end, comment.box)
              this.commentsByIndexRemove(comment._id, wIndex, cIndex)
              if (comment.replies && comment.replies.length > 0) {
                this.removeRepliesFromComments(comment)
              }
            }
            if (comment.questionId && this.project.isTeaching) {
              // in this case we got an answer, so we need to update comment stats
              this._projects.recalculateAnswers(comment, false)
            }
          } else if (commentUpdate.action === 'UPDATE') {
            if (cIndex > -1 && this.commentsByIndex[wIndex] && this.commentsByIndex[wIndex][cIndex]) {
              this.commentsByIndexUpdate(comment, wIndex, cIndex)
            } else {
              // Socket updates don't come through with a timestamp
              comment.createdAt = Date.now()
              // Sometimes an UPDATE comes through for comment not yet created
              // Add highlights to local array
              this.incrementHighlights(
                this.user._id === comment.user_id || this.project.teacher_id == comment.user_id,
                comment.start,
                comment.end,
                comment.box,
              )
              this.commentsByIndexAdd(comment, wIndex, true)
            }
            if (comment.reply_to) {
              this.addReplyToComment(comment)
            }
            if (comment.questionId && this.project.isTeaching) {
              // in this case we got an answer, so we need to update comment stats
              this._projects.recalculateAnswers(comment, true)
            }
          } else if (commentUpdate.action === 'CREATE') {
            // Socket updates don't come through with a timestamp
            comment.createdAt = Date.now()
            // Add highlights to local array
            this.incrementHighlights(
              this.user._id === comment.user_id || this.project.teacher_id == comment.user_id,
              comment.start,
              comment.end,
            )
            this.commentsByIndexAdd(comment, wIndex, true)
            if (comment.questionId && this.project.isTeaching) {
              // in this case we got an answer, so we need to update comment stats
              this._projects.recalculateAnswers(comment, true)
            }
          }
        },
        error => {
          console.warn(error)
        },
      ),
    )

    // Subscribe to Heat Vision toggle updates
    this.subscriptions.push(
      this._socket.heatVisionUpdates.subscribe(heatToggle => {
        this.project.heat_vision = heatToggle.heatVision.all
        // Re-evaluate comment line counts
        this._projects.buildCommentsByPos()
        // We send the message here because we only care to show it when the user has the reading loaded
        this.showHeatVisionToast(this.project.heat_vision)
      }),
    )

    /**
     * Our socket handler for group-specific socket update events
     * groupUpdate.type is the identifier for specific events
     */
    this.subscriptions.push(
      // Subscribe to feedback updates
      this._socket.groupUpdate.subscribe(groupUpdate => {
        if (groupUpdate.type === 'feedbackUpdate') {
          let feedback = groupUpdate['feedback']
          this.setFeedback(feedback)
          if (feedback.user_id === this.user._id) {
            this.showCommentToast(feedback, 'feedback')
          }
        } else if (groupUpdate.type === 'replyUpdate') {
          const reply = groupUpdate['reply']
          const parentCommentId = groupUpdate['pComment']
          let parentComment = this.project.comments.find(comment => {
            return parentCommentId == comment._id
          })
          // set the parent comment id so we can find it later
          reply.parent = parentCommentId
          // reference the parent comment and make sure it's
          if (reply.user_id !== this.user._id && parentComment['user_id'] === this.user._id) {
            this.showCommentToast(reply, 'reply')
          }
        } else if (groupUpdate.type === 'coteacherPromote') {
          // Show promotion toast for user
          if (groupUpdate.user._id === this.user._id) {
            this.showPromotedToast()
          }
        }
      }),
    )

    // Subscribe to updates on where to move the lastWord for the infinity scroll
    this.subscriptions.push(
      this._projects.lastWordUpdateState.subscribe(lastWord => {
        this.lastWord = lastWord + this.lastWordImageOffset
      }),
    )

    // After comments are added to the array
    // this.updateAllLineCounts()
    this.updateImageHeights()

    // Hacky McHackFace since images render later, and need to be rendered to determine comment position
    setTimeout(() => {
      this.setLinePositions()
      this.commentFragScrollReady = true
    }, this.renderTimeout)

    // Only supported by modern browsers, but very reliable in those cases
    document.addEventListener('selectionchange', event => {
      if (!this.optionsShow) {
        this.showCommentOptions(event)
      }
    })
  } // ngOnInit

  ngAfterViewInit() {
    this.subscriptions.push(
      /**
       * Subscribe to link params (deep links to comments/replies)
       * - In AfterViewInit due to "commentComponents" use
       */
      this.route.queryParams.subscribe(params => {
        // handler for feedback
        if (params['feedback']) {
          let feedbackEl = this.feedbackEl.toArray().find(feedbackEl => {
            return feedbackEl.feedback._id === params['feedback']
          })
          // Scroll to feedback
          feedbackEl.element.nativeElement.scrollIntoView({ behavior: 'smooth' })
        } else if (params['comment']) {
          // Reset selected comment values
          // > ensures comment pane scroll action when transitioning between comments and replies
          if (this.selectedComment) this.selectedComment.selected = false
          if (this.selectedReply) this.selectedReply.selected = false
          // Parent indicates a reply comment
          let isReply = !!params['parent']
          let commendId = isReply ? params['parent'] : params['comment']
          let commentEl = this.commentComponents.toArray().find(commentEl => {
            return commentEl.comment._id === commendId
          })
          // Cancel if comment not found
          if (!commentEl) {
            // Clear param if comment not found
            this.clearQueryParams()
            return
          }
          // when the page loads with a fragment that links to a comment that is on a word that has not yet rendered
          if (commentEl.comment.start > this.lastWord) {
            this.lastWord = commentEl.comment.start + 800
            // Make sure we broadcast lastWord position out to listening components
            this._projects.lastWordUpdateSubj.next(this.lastWord)
          }
          // Hack that follows same settimeout as the below for updating image heights
          // We have to wait for images and questions to load in order for the scroll on load to be accurate
          // after the intitial load, we only want a 1ms timeout to prevent errors is all
          let scrollTimeout = this.renderTimeout
          if (this.commentFragScrollReady) {
            scrollTimeout = 1
          }
          // settimeout here to prevent errors where expression changes after checked
          setTimeout(() => {
            // Scroll to line in reading where comment was made
            commentEl && commentEl.el.nativeElement.scrollIntoView({ behavior: 'smooth' })
            // Toggle the comment pane
            if (isReply) {
              let reply = this.project.comments.find(comment => {
                return (comment._id = params['comment'])
              })
              this.toggleCommentPane(true, commentEl.comment, reply)
            } else {
              this.toggleCommentPane(true, commentEl.comment)
            }
          }, scrollTimeout)
        }
      }),
    )
  }

  ngOnDestroy() {
    this._readings.clear()
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })

    // Clear heat vision message
    this._messages.dismissToast('heat')
    // Clear feedback message
    this._messages.dismissToast('feedback')
  }

  /**
   * Updates the rendered words as the user scrolls through the reading
   */
  private onScrollUpdate(): void {
    let bottomOfArticle = this.contentEl.nativeElement.offsetTop + this.contentEl.nativeElement.clientHeight
    let bottomOfView = window.innerHeight + document.scrollingElement.scrollTop
    let distanceFromViewport = 500
    if (bottomOfArticle - distanceFromViewport < bottomOfView) {
      this.lastWord += 800
      // Make sure we broadcast lastWord position out to listening components
      this._projects.lastWordUpdateSubj.next(this.lastWord)
      // Re-run the line positions so comment avatars show up in the right spot
      this.setLinePositions()
    }
  }

  /**
   * Sets the minimum height of the document for better current scroll position rendering
   */
  private preScrollHeightUpdate(): void {
    let body = document.body
    let html = document.documentElement
    // Find the maximum document height
    let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
    // Extrapolate a value for document height based on total words and words already rendered with the current height
    if (this.reading && this.reading.words) {
      this.currentDocHeight = (height * this.reading.words.length) / this.lastWord
    }
  }

  // Updates OGP
  private updateMetaTags(): void {
    document.querySelector('meta[property="og:title"]').setAttribute('content', this.reading.title)
    // let blurb: string
    // blurb += '...'
    // document.querySelector('meta[property="og:description"]').setAttribute('content', blurb)
    // let firstImage = document.querySelector('.img-wrap img')
    // if (firstImage) {
    //     document.querySelector('meta[property="og:image"]').setAttribute('content', firstImage.getAttribute('src'))
    // }
  }

  // Adds the question number to each question for proper rendering
  private updateQuestionNumbers(questions) {
    for (let i = 0; i < questions.length; i++) {
      questions[i].question_number = i + 1
    }
  }

  /**
   * Display heat vision toast
   * @param heatVisionOn
   */
  private showHeatVisionToast(heatVisionOn: boolean) {
    let heatStatus = heatVisionOn ? 'on' : 'off'
    let heatMessage = this.isGroupTeacher() ? 'You have turned Heat Vision' : 'Your teacher has turned Heat Vision'
    // Send toast via message service
    this._messages.sendToast({
      message: heatMessage + ' <b>' + heatStatus + '</b>',
      type: 'heat-' + heatStatus,
      id: 'heat',
      limitToPage: 'project',
    })
  }

  /**
   * Display new live interaction toast
   * @param content is the content object of the live interaction type
   * @param toastType is the type of live interaction (feedback, reply)
   */
  private showCommentToast(content: any, toastType: toastType) {
    if (toastType === 'feedback') {
      // Send toast via message service
      this._messages.sendToast({
        message: 'You have new feedback from your teacher',
        type: 'new-feedback',
        id: 'newFeedback',
        link: './',
        linkParams: { feedback: content._id },
        limitToPage: 'project',
        requireDismiss: true,
      })
    } else if (toastType === 'reply') {
      // Send toast via message service
      this._messages.sendToast({
        message: `<b>${content.author}</b> replied to your comment<div class="toast__action">View reply</div>`,
        type: 'new-reply',
        id: 'newReply',
        link: './',
        linkParams: { comment: content._id, parent: content.parent },
        limitToPage: 'project',
        requireDismiss: true,
      })
    }
  }

  /**
   * Clear Query Params
   * - Used to clear deep link params for comments/replies
   */
  private clearQueryParams(): void {
    // this._router.navigate(['./'], { relativeTo: this.route, queryParams: {}, replaceUrl: true })
    this.location.replaceState(this._router.url.split('?')[0])
  }

  private showPromotedToast(): void {
    this._messages.sendToast({
      message: 'You have been promoted to co-teacher, please refresh!',
      type: 'promoted',
      id: 'coteacherPromoted',
      limitToPage: 'project',
      requireDismiss: true,
    })
  }

  /**
   * Is group owner?
   * @return boolean: is current user the owner of the active reading/group
   */
  private isGroupTeacher(): boolean {
    return this.project.teacher_id === this.user._id
  }

  hideCommentOptions(event?): void {
    this.optionsShow = false
    this.imageHotspotPlaceholder['preview'] = false
    this.clearQuickSelect()
  }

  clearQuickSelect(): void {
    if (this.quickSelect.anchor != null) {
      // We can safely clear all highlight values
      this.focusArray = []
    }
    this.quickSelect = {
      focus: null,
      anchor: null,
    }
  }

  /**
   * Show tooltip to the side with buttons for adding comment types
   */
  showCommentOptions(event): void {
    if (this.showCommentOptionsWait || this.project.archived) {
      return
    } else {
      // We only need to worry about preventing overlapping touch and click events
      if (event.type != 'selectionchange') {
        this.showCommentOptionsWait = true
        setTimeout(() => {
          this.showCommentOptionsWait = false
        }, 200)
      }
    }
    // Only show options if text selected
    let sel = Rangy.getSelection()
    let target = event.target || event.srcElement || event.currentTarget
    let scrollOffset = this.annotatorPaper.getBoundingClientRect().top
    const readingPad = 52
    // let targetTag = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : ''

    /**
     * Handle creating selection and coordinates for comments on images
     * + Spot highlights
     * + Word/hit box highlights
     */
    let hitImage: boolean
    let hitBox: boolean
    if (target.classList) {
      hitImage = target.classList.contains('reading-image')
      hitBox = target.classList.contains('w-box')
    }

    if ((hitImage || hitBox) && target['parentNode']) {
      //  Clear current focus style
      this.focusArray = []
      // Determine SPOT or BOX
      if (hitBox) {
        this.optionsShow = false
        let boxIndex: number = parseInt(target.getAttribute('index'))
        let wordIndex: number = parseInt(target.getAttribute('w-index'))
        if (
          this.quickSelect.boxes &&
          typeof this.quickSelect.boxes.start != 'undefined' &&
          !this.quickSelect.boxes.end
        ) {
          // indicates box index
          this.quickSelect.boxes.end = boxIndex
        } else {
          // Clear and begin new Quick Select
          this.clearQuickSelect()
          this.quickSelect.boxes = {
            word: wordIndex,
            start: boxIndex,
          }
        }
        // Only get coordinates for first word
        if (!this.quickSelect.boxes.end || this.quickSelect.boxes.end < this.quickSelect.boxes.start) {
          // Set click coordinates from box
          this.imageCoords = this.getBoxCoords(target)
        }
        this.focusHighlight(wordIndex, wordIndex, null, {
          start: this.quickSelect.boxes.start,
          end: this.quickSelect.boxes.end ? this.quickSelect.boxes.end : this.quickSelect.boxes.start,
        })
      } else {
        // Set click coordinates
        this.imageCoords = this.getRelativeCoords(event)
        // when they click the picture, we need to create the selection for them
        let range = Rangy.createRange()
        range.selectNodeContents(target['parentNode'])
        // this makes sure there are no other selections made
        sel.setSingleRange(range)
        // When tapping image, clear in progress Quick Select
        this.clearQuickSelect()
        // Create placeholder spot
        this.imageHotspotPlaceholder = {
          index: target.getAttribute('index'),
          x: this.imageCoords['x'],
          y: this.imageCoords['y'],
          preview: true,
        }
      }
    } else {
      delete this.quickSelect.boxes
      // Functions as "click outside" for images
      this.optionsShow = false
      this.imageHotspotPlaceholder.preview = false
      // Clear imageCoords so they are not added to non-image comments
      this.imageCoords = {}
      if (target.classList && target.classList.contains('img')) {
        return
      }
    }

    if (
      sel &&
      (this.imageHotspotPlaceholder.preview || this.quickSelect.boxes || sel.toString()) &&
      ((sel.focusNode.classList && sel.focusNode.classList.contains('w')) ||
        (sel.focusNode.parentNode.classList.contains('w') ||
          sel.focusNode.parentNode.classList.contains('img-wrap'))) &&
      ((sel.anchorNode.classList && sel.anchorNode.classList.contains('w')) ||
        (sel.anchorNode.parentNode.classList.contains('w') || sel.anchorNode.parentNode.classList.contains('img-wrap')))
    ) {
      /**
       * Make sure selection exists, and is within highlightable content
       * - Runs when:
       *      - Regular selection is being made
       *      - Image hotspot is made
       * - Should:
       *      - Clear Quick Select
       */
      let focusY
      // Clear Quick Select
      !this.quickSelect.boxes && this.clearQuickSelect()
      // Find Y position of selection (for comment options)
      if (!!sel.focusNode.getBoundingClientRect) {
        focusY = sel.focusNode.getBoundingClientRect().top
      } else {
        focusY = sel.focusNode.parentNode && sel.focusNode.parentNode.getBoundingClientRect().top
      }
      // Set y position of comment options
      this.highlightY = focusY - scrollOffset + readingPad
      // Adjust y position for image comments
      if (this.imageHotspotPlaceholder.preview == true) {
        let yOnImage = this.imageHeight[this.imageHotspotPlaceholder.index]
        // Offset 10px to line up with hotspot
        this.highlightY = this.highlightY + (this.imageHotspotPlaceholder.y / 100) * yOnImage - 10
      }
      // Show comment options
      this.optionsShow = true
      // Guide content
      if (this.guideStepNo < 2) {
        this.guideStepNo = 2
      }
    } else if (
      target.getAttribute &&
      target.getAttribute('index') != null &&
      target.classList &&
      !target.classList.contains('question') &&
      !target.classList.contains('br')
    ) {
      /**
       * Quick Select
       * - Runs when words are tapped
       * - Should:
       *      - Clear other types of commenting
       */
      let wordI = parseInt(target.getAttribute('index'))
      let prevAnchor = this.quickSelect.anchor
      let prevFocus = this.quickSelect.focus
      let focusY

      // If tapped question, ignore event
      if (target.classList.contains('question') || target.classList.contains('br')) {
        return
      }

      // If tapped word is space, select next word
      let wordText = (target.innerText || '').trim()
      if (wordText.length < 1 && wordI != 1) {
        wordI--
      }

      // Set the anchor (start) or focus (end) for the highlight section on the clickable highlighting
      if (prevAnchor == null && prevFocus == null) {
        this.quickSelect.anchor = wordI
        this.focusHighlight(wordI, wordI)
      } else if (prevAnchor != null && prevFocus == null) {
        this.quickSelect.focus = wordI
        this.focusHighlight(prevAnchor, wordI)
      } else if (prevAnchor != null && prevFocus != null) {
        // Restart focusing
        this.unfocusHighlight(prevAnchor, prevFocus)
        this.quickSelect.anchor = wordI
        this.quickSelect.focus = null
        this.focusHighlight(wordI, wordI)
      }

      // Set Options Y
      if (!!target.getBoundingClientRect) {
        focusY = target.getBoundingClientRect().top
      } else {
        focusY = target.parentNode && target.parentNode.getBoundingClientRect().top
      }
      // Set y position of comment options
      this.highlightY = focusY - scrollOffset + readingPad
      this.optionsShow = true
    } else {
      this.hideCommentOptions()
    }
  }

  updateImageHeights(): void {
    let images: any[] = Array.from(document.querySelectorAll('#annotatorContent .img-wrap img'))
    for (let i = 0; i < images.length; i++) {
      this.imageHeight[images[i].getAttribute('index')] = images[i].clientHeight
    }
  }

  /**
   * Fired by Output from the Comment Component
   * - References _projects.commentByPos
   */
  expandLine(lineY: number, forceSet?: boolean) {
    let commentsByPos = this._projects.commentByPosSource
    // If collapsing a line, make sure to deactivate all comments
    if (forceSet === false) {
      this._comments.deactivateAllComments()
      this.lineExpanded = 0
    }
    if (commentsByPos[lineY]) {
      // Keep track of which line is expanded
      if (forceSet === true) {
        this.lineExpanded = lineY
      }
      // Loop through comments on line and mark comments as expand
      for (let i = 0; i < commentsByPos[lineY].length; i++) {
        let comment = commentsByPos[lineY][i]
        if (typeof forceSet !== 'undefined') {
          comment.expanded = forceSet
        } else {
          comment.expanded = !comment.expanded
        }
      }
    }
  }

  /**
   * Add new highlights to local array
   */
  incrementHighlights(
    alwaysHighlight: boolean,
    start: number,
    end: number,
    box?: { start: number; end: number },
  ): void {
    this.updateHighlights(1, alwaysHighlight, start, end, box)
  }

  /**
   * Remove highlights from local array
   */
  decrementHighlights(
    alwaysHighlight: boolean,
    start: number,
    end: number,
    box?: { start: number; end: number },
  ): void {
    this.updateHighlights(-1, alwaysHighlight, start, end, box)
  }

  /**
   * Updates highlight array
   */
  updateHighlights(
    increment: number,
    alwaysHighlight: boolean,
    start: number,
    end: number,
    box: { start: number; end: number },
  ): void {
    if (!box) {
      // We process non-box comments at index 0 in highlight arrays
      box = {
        start: 0,
        end: 0,
      }
    }
    for (let bi = box.start; bi <= box.end; bi++) {
      if (alwaysHighlight) {
        for (var i = start; i <= end; i++) {
          if (this.alwaysHighlightArray[i] && this.alwaysHighlightArray[i][bi] > 0) {
            this.alwaysHighlightArray[i][bi] += increment
          } else {
            if (!this.alwaysHighlightArray[i]) {
              this.alwaysHighlightArray[i] = []
            }
            this.alwaysHighlightArray[i][bi] = increment > 0 ? increment : 0
          }
        }
      } else {
        for (var i = start; i <= end; i++) {
          if (this.highlightArray[i] && this.highlightArray[i][bi] > 0) {
            this.highlightArray[i][bi] += increment
          } else {
            if (!this.highlightArray[i]) {
              this.highlightArray[i] = []
            }
            this.highlightArray[i][bi] = increment > 0 ? increment : 0
          }
        }
      }
    }
  }

  /**
   * Create a Comment of any Type
   * Requires three parameters, and finds the other information it needs
   * @param start Index of first word
   * @param end Index of last word
   * @param type What kind of comment: emoji, text...
   */
  createComment(span: SelectionSpan, type: string): void {
    let isBox = typeof span.boxStart == 'number' && typeof span.boxEnd == 'number'
    // We need to make sure they aren't already editing a comment
    this.inactivateComment()

    // Attach highlighted text to comment
    let text: string = ''
    if (!isBox) {
      // Regular text highlight
      for (let i = span.start; i <= span.end; i++) {
        text += this.reading.words[i] && this.reading.words[i].str ? this.reading.words[i].str : ' '
      }
    } else {
      // Text/hit-box in image/pdf highlight
      for (let i = span.start; i <= span.end; i++) {
        let page = this.reading.words[i]
        for (let bi = span.boxStart; bi <= span.boxEnd; bi++) {
          text += page.boxes[bi] && page.boxes[bi]['str'] ? page.boxes[bi]['str'] + ' ' : ''
        }
      }
    }
    // We don't want trailing whitespaces saved for highlighted text
    text = text.trim()
    // Build comment
    let comment = <EdjiComment>{
      data: '',
      start: span.start,
      end: span.end,
      type: type,
      text: text,
      loc: this.imageCoords,
    }
    // Attach box indices
    if (isBox) {
      comment.box = {
        start: span.boxStart,
        end: span.boxEnd,
        start_x: this.imageCoords.x,
        start_y: this.imageCoords.y,
      }
      // remove coords
      delete comment.loc
    }
    // Tell server we've added a comment
    this._projects
      .saveComment(comment)
      .then(comment => {
        // We add the comment from the service because it has an Id
        if (comment._id) {
          // Add setting to trigger focus on new comment
          comment.new = true // this is basically to tell our test cases which comment was just made
          this.commentsByIndexAdd(comment, comment.start)
        } else {
          console.warn("Didn't get a comment back from server!")
        }

        // Guide content
        if (this.guideStepNo < 3) {
          this.guideStepNo = 3
        }
      })
      .catch(error => {
        // We should figure out how to handle this properly!
        // Maybe show a warning icon?
        console.warn(error)
      })
  } // createComment

  commentsByIndexUpdate(comment, wordIndex: number, commentIndex: number) {
    this.commentsByIndex[wordIndex][commentIndex].data = comment.data
  }

  commentsByIndexAdd(comment, index: number, addQuietly?: boolean): void {
    let start = comment.start

    // Add comment to local project array
    this.project.comments.unshift(comment)
    let commentPointer = this.project.comments[0]

    // Add Comment to local array
    if (this.commentsByIndex[start]) {
      this.commentsByIndex[start].push(commentPointer)
      if (addQuietly !== true) {
        this.setActiveCommentByIndex(true, start, this.commentsByIndex[start].length - 1)
      }
    } else {
      this.commentsByIndex[start] = [commentPointer]
      if (addQuietly !== true) {
        this.setActiveCommentByIndex(true, start, 0)
      }
    }

    this._projects.commentStats.addCommentToStats(commentPointer, 1)
  }

  /**
   * Removes comment from locally transformed array (commentsByIndex)
   */
  commentsByIndexRemove(commentId, index: number, commentIndex: number) {
    let comment = this.commentsByIndex[index][commentIndex]
    let commentPointer
    let commentCopy
    // Find comment in local Comments array
    let commentsLength: number = this.project.comments.length
    // Some comments are removed from this array by the Project service, so don't expect to find one
    for (let i = 0; i < commentsLength; i++) {
      if (this.project.comments[i]._id == commentId) {
        commentPointer = this.project.comments[i]
        commentCopy = Object.assign({}, commentPointer)
        this.project.comments.splice(i, 1)
        break
      }
    }
    // Project service handles stats updates as well, but we need to handle socket updates
    if (commentCopy) {
      this._projects.commentStats.addCommentToStats(commentCopy, -1)
    }
    // Remove from index reference object
    for (let i = 0; i < this.commentsByIndex[index].length; i++) {
      if (this.commentsByIndex[index][i]._id == commentId) {
        this.commentsByIndex[index].splice(i, 1)
        break
      }
    }
    // Update line counts
    this._projects.buildCommentsByPos()
  }

  /**
   * Fires after the comment has been deleted in the database
   * - Removes comment from locally transformed array (commentsByIndex)
   * - De-increments the highlights
   */
  removeComment(comment, index: number, commentIndex: number) {
    // Remove Highlights
    this.decrementHighlights(this.user._id === comment.user_id, comment.start, comment.end, comment.box)
    // Remove local comment object
    this.commentsByIndexRemove(comment._id, index, commentIndex)
    this.unfocusHighlight(comment.start, comment.end)
  }

  setActiveCommentByIndex(isActive: boolean, wordIndex: number, commentIndex: number, comment?: EdjiComment): void {
    // Any currrently active comments need to be deactivated
    this.inactivateComment()
    if (isActive) {
      if (typeof comment !== 'undefined') {
        this._comments.activeComment = comment
        this._comments.activeComment.active = true
      } else {
        this.selectedComment = this._comments.activeComment = this.commentsByIndex[wordIndex][commentIndex]
        this._comments.activeComment.active = true
      }
    }
  }

  inactivateComment(): void {
    if (this._comments.activeComment.start) {
      this.unfocusHighlight(
        this._comments.activeComment.start,
        this._comments.activeComment.end,
        this._comments.activeComment.box,
      )
      this._comments.activeComment.active = false
      this._comments.activeComment = <EdjiComment>{}
    }
  }

  /**
   * Receive comment data from input sources:
   * - Gets event from Emoji Keyboard
   */
  updateActiveComment(commentData: string) {
    this._comments.activeComment.data = commentData
  }

  /**
   * Returns Start and End word indices of text selection
   * @description Provides start/end AND clears selection
   */
  getSelectionSpan(): SelectionSpan {
    let start: number
    let end: number
    let span: SelectionSpan

    if (this.quickSelect.boxes && typeof this.quickSelect.boxes.word == 'number') {
      // Image/PDF hit/word box
      start = this.quickSelect.boxes.word
    } else if (
      this.imageHotspotPlaceholder &&
      this.imageHotspotPlaceholder.preview &&
      this.imageHotspotPlaceholder.index
    ) {
      // Image Selection
      start = this.imageHotspotPlaceholder.index
    } else if (this.quickSelect.anchor != null) {
      // Quick Select Selection (Underline)
      start = this.quickSelect.anchor
      end = this.quickSelect.focus != null ? this.quickSelect.focus : start
      this.quickSelect.focus = null
      this.quickSelect.anchor = null
    } else {
      // Browser API selection
      let selection = Rangy.getSelection()
      let getNodeIndex = function(node: any): number {
        // Selections often happen at the text node level, inside the actual element
        // In which case we need to reference its parent node
        // Note: we tried node.hasOwnProperty here and would sometimes get a false true resolution of the if statement... not sure how that is possible
        if (!!node.className && node.className == 'w') {
          return parseInt(node.getAttribute('index'))
        } else {
          return parseInt(node.parentNode.getAttribute('index'))
        }
      }

      if (selection['anchorNode'] && selection['focusNode']) {
        start = getNodeIndex(selection['anchorNode'])
        end = getNodeIndex(selection['focusNode'])
        // Hide tool tips
        this.hideCommentOptions()
        // Clear selections
        selection.removeAllRanges()
      }
    }
    // It's possible that a selection is made backwards
    // We want the start index to come first
    if (start > end) {
      end = [start, (start = end)][0] // Swap start and end values
    }
    // Fix for commenting on images in Safari
    if (!start && start != 0) {
      start = end
    }
    if (!end && end != 0) {
      end = start
    }
    span = { start: start, end: end }
    // Attach box indices
    if (this.quickSelect.boxes && typeof this.quickSelect.boxes.start == 'number') {
      span.boxStart = this.quickSelect.boxes.start
      span.boxEnd = this.quickSelect.boxes.end ? this.quickSelect.boxes.end : span.boxStart
    }
    // Make sure box start and end are sequential
    if (span.boxStart > span.boxEnd) {
      span.boxEnd = [span.boxStart, (span.boxStart = span.boxEnd)][0] // Swap start and end values
    }
    return span
  }

  /**
   * Add Comment of type
   * - Fired from comment options tooltip
   */
  addCommentOfType(type: string): void {
    // Get selection indices
    let span = this.getSelectionSpan()

    if (!(span.start >= 0) || !(span.end >= 0)) {
      return
    }
    // Increment highlight array
    this.incrementHighlights(true, span.start, span.end, { start: span.boxStart, end: span.boxEnd })
    // Tell the server we've got a comment!
    this.createComment(span, type)
  }

  /**
   * Loops through child elements to find textnodes
   * Pushes text nodes as formatted objects into this.words
   * @param element Root element to start crawling from
   */
  private extractTextNodes(element: any, ancestorTags?: string[]) {
    let tagName = element.tagName.toLowerCase()
    let nodes = element.childNodes

    // Children should inherit tags from several elements up
    // eg. "B" style should propagate down
    if (!ancestorTags) {
      ancestorTags = []
    }

    if (ancestorTags.indexOf(tagName) < 0) {
      ancestorTags.push(tagName)
    }

    for (let index = 0; index < nodes.length; index++) {
      let node = nodes[index]
      // Copy tags array to variable local to loop instance
      let inheritedTags = ancestorTags.slice()

      if (node.nodeType === 3) {
        // Found a text node!

        // Split text inside child nodes
        let nodeWords = node.textContent.split(/(?:([^a-zA-Z0-9]))/).filter(function(el) {
          return el.replace(/([\n])/g, '')
        })

        // If empty element, push a spacer word to reflect that
        if (nodeWords.length < 1) {
          this.words.push({
            str: '',
            styles: ['space', 'space-first', 'space-last'].concat(inheritedTags),
          })
        }

        // Otherwise loop through words, and process into array
        for (let wIndex = 0; wIndex < nodes.length; wIndex++) {
          let nodeWord = nodeWords[wIndex]
          let word = {
            str: nodeWord,
            styles: [].concat(inheritedTags),
          }
          let addBr = false
          if (word.str && word.str.trim().length < 1) {
            word.styles.push('space')
          }
          if (index == 0 && wIndex == 0) {
            word.styles.push(tagName + '-first')
          }
          if (index == nodes.length - 1 && wIndex == nodeWords.length - 1) {
            word.styles.push(tagName + '-last')
            addBr = true
          }
          this.words.push(word)
          if (addBr) {
            // Add break element
            this.words.push({
              str: '',
              styles: ['br'],
            })
          }
        }
      } else {
        // If not a text node, dig deeper for text nodes
        this.extractTextNodes(node, inheritedTags)
      }
    }
  }

  /**
   * Update focusArray for a specified selection
   * @param value true or false - are you adding or removing focus?
   */
  private updateFocusArray(value: boolean, start: number, end: number, boxes?: { start: number; end: number }): void {
    // Make sure start and end are in order
    if (start > end) {
      end = [start, (start = end)][0] // Swap start and end values
    }
    if (!boxes) {
      for (var i = start; i <= end; i++) {
        this.focusArray[i] = value
      }
    } else {
      // Handle box highlighting
      this.focusArray[start] = []
      // let boxEnd = boxes.end || boxes.start
      if (!boxes.end) {
        boxes.end = boxes.start
      }
      if (boxes.start > boxes.end) {
        boxes.end = [boxes.start, (boxes.start = boxes.end)][0] // Swap start and end values
      }
      for (let bi = boxes.start; bi <= boxes.end; bi++) {
        this.focusArray[start][bi] = value
      }
    }
  }

  /**
   * Adds focus text highlighted for the relevant comment
   * @param start Index for first word
   * @param end Index for last word
   */
  public focusHighlight(start, end, location?: any, boxes?: { start: number; end: number }): void {
    if (this.optionsShow == true) {
      return
    }
    // Apply focus underline
    this.updateFocusArray(true, start, end, boxes)
    // Hot-spot focus
    if (location && location.x && location.y) {
      this.imageHotspotPlaceholder = {
        index: start,
        x: location.x,
        y: location.y,
        focus: true,
      }
    }
  }

  /**
   * Removes a class to focus text highlighted for the relevant comment
   * @param start Index for first word
   * @param end Index for last word
   */
  public unfocusHighlight(start, end, location?: any, boxes?: { start: number; end: number }): void {
    if (this.focusOverride) {
      return
    }
    // Remove focus underline
    this.updateFocusArray(false, start, end, boxes)
    // Remove hot-spot focus
    this.imageHotspotPlaceholder['focus'] = false
  }

  /**
   * Determines highlight heat for a word!
   * => Pure function, all vars provided as arguments (optimized for Angular doCheck)
   * => Keep this light! It runs for every word instance
   * @param i is the word index
   */
  public getHighlightClass(
    projectHeat_vision,
    projectIsTeaching,
    filterHighlightArray,
    highlightArray,
    alwaysHighlightArray,
    i: number,
    bi?: number,
  ): string {
    let classString = ''
    let highlightCount = 0
    if (!bi) {
      bi = 0
    }

    // If a filter is applied, use filter highlights
    if (this.filterHighlightArray) {
      if (this.filterHighlightArray[i] && this.filterHighlightArray[i][bi]) {
        highlightCount += this.filterHighlightArray[i][bi]
      }
    } else {
      // Show student highlights
      if (
        (this.project.heat_vision || this.project.isTeaching) &&
        this.highlightArray[i] &&
        this.highlightArray[i][bi]
      ) {
        highlightCount += this.highlightArray[i][bi]
      }
      // Show user's own highlights and teacher highlights
      if (this.alwaysHighlightArray[i] && this.alwaysHighlightArray[i][bi]) {
        highlightCount += this.alwaysHighlightArray[i][bi]
      }
    }

    return classString + ' h-' + highlightCount
  }

  getBoxQuickSelect(i: number, bi: number): string {
    if (this.quickSelect.boxes && (bi == this.quickSelect.boxes.start || bi == this.quickSelect.boxes.end)) {
      return 'quick-select--click'
    }
    return ''
  }

  /**
   * Get word focus class (keep it LIGHT)
   * @param focusArray
   * @param i word index
   */
  public focusClass(focusArray, i: number, bi?: number): string {
    // Apply focus class to words of focused comments
    if (focusArray[i] === true || (typeof bi == 'number' && (focusArray[i] && focusArray[i][bi]))) {
      return 'h-f'
    } else {
      return ''
    }
  }

  /**
   * Get Quick Select class (keep it LIGHT)
   * @param quickSelect anchor/focus object
   * @param i word index
   */
  public quickSelectClass(quickSelect, i): string {
    if (i === quickSelect.focus || i === quickSelect.anchor) {
      return 'quick-select--click'
    } else {
      return ''
    }
  }

  /** Used to determine which level of permission the user has for a specific comment
   * @param comment A comment object
   */
  private getCommentPermissions(comment: any): number {
    return this._comments.getCommentPermissions(comment, this.user, this.project)
  }

  /**
   * For image hit/word box comments: Determines relative middle of word
   */
  private getBoxCoords(el: HTMLElement): { x: number; y: number } {
    let top = parseFloat(el.style.top.replace('%', '').replace('px', ''))
    let left = parseFloat(el.style.left.replace('%', '').replace('px', ''))
    let height = parseFloat(el.style.height.replace('%', '').replace('px', ''))
    let width = parseFloat(el.style.width.replace('%', '').replace('px', ''))

    return { x: left + width / 2, y: top + height / 2 }
  }

  /**
   * For image comments: Determines relative location of hotspot
   */
  private getRelativeCoords(e: Event): { x: number; y: number } {
    let target = e.target
    let PosX = 0
    let PosY = 0
    let ImgPos

    // Handle touch events
    if (e.type == 'touchend') {
      let touches = e['touches']
      if (touches.length < 1) {
        touches = e['changedTouches']
      }
      e = touches[0]
      target = e.target
    } else if (e.type == 'tap') {
      let pointers = e['pointers']
      if (pointers.length < 1) {
        pointers = e['changedPointers']
      }
      e = pointers[0]
      target = e.target
    } else {
      // assume click
    }

    function FindPosition(oElement) {
      if (typeof oElement.offsetParent != 'undefined') {
        for (var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent) {
          posX += oElement.offsetLeft
          posY += oElement.offsetTop
        }
        return [posX, posY]
      } else if (oElement.offsetX && oElement.offsetY) {
        return [oElement.offsetX, oElement.offsetY]
      } else {
        return [oElement.x, oElement.y]
      }
    }
    ImgPos = FindPosition(target)

    if (e['pageX'] || e['pageY']) {
      PosX = e['pageX']
      PosY = e['pageY']
    } else if (e['clientX'] || e['clientY']) {
      PosX = e['clientX'] + document.body.scrollLeft + document.documentElement.scrollLeft
      PosY = e['clientY'] + document.body.scrollTop + document.documentElement.scrollTop
    }

    return {
      x: parseFloat((((PosX - ImgPos[0]) / target['clientWidth']) * 100).toFixed(3)),
      y: parseFloat((((PosY = PosY - ImgPos[1]) / target['clientHeight']) * 100).toFixed(3)),
    }
  }

  /**
   * Decides if the Emoji Keyboard is active
   */
  public isEmojiKeyboardActive(): boolean {
    // return this._comments.isEmojiKeyboardActive(this.user)
    return this._comments.setEmojiKeyboardActive(this.user)
  }

  public discReplyFire(comment) {
    this.replyComment = comment
    this.focusOverride = true
    this.focusHighlight(comment.start, comment.end, comment.loc)
    this.showDiscussions = true
  }

  public hideDiscussions(comment: any) {
    this.showDiscussions = false
    this.focusOverride = false
    this.unfocusHighlight(comment.start, comment.end, comment.loc)
  }

  /**
   * setLinePositions gives us the number of lines in the project
   *
   * If the height of the word element does not match the one before it, this counts as a new line
   * We check this every time the comment pane is open in case the user adjusts screen width
   */
  setLinePositions(): void {
    if (typeof this.commentComponents == 'undefined') {
      setTimeout(() => {
        this.setLinePositions()
      }, 500)
      return
    }
    // We need majority of content loaded before checking the height
    if (this.currentDocHeight == 0) {
      this.preScrollHeightUpdate()
    }
    // Let's do this!
    let allComments = this.commentComponents.toArray()
    // Only run this if the words are rendered and if it isn't already running
    if (!this.lineNumRunning && allComments.length > 0) {
      this.lineNumRunning = true

      // Loop through each word element and tell comments to update line number
      let len: number = allComments.length
      for (let i = 0; i < len; i++) {
        let commentComp = allComments[i]
        // Tell comments to update lineY value
        commentComp.setLineY()
      }
      // Set up comments by line for Comment Pane
      this._projects.buildCommentsByPos()
      // Done!
      this.lineNumRunning = false
    }
  }

  public toggleCommentPane(visible?: boolean, selectedComment?, selectedReply?): void {
    /**
     * In tablet view, the width of content changes as the pane slides
     * @todo determine a better layout option that doesn't cause relevant comments to change
     */
    let annotatorWidth = this.annotatorContent.clientWidth
    setTimeout(() => {
      // Limit when set line position fires, heavy w/ lots of comments
      if (annotatorWidth != this.annotatorContent.clientWidth) {
        this.setLinePositions()
      }
    }, 500)

    // Set the input comment to the comment pane if it is not currently open
    if (visible) {
      if (selectedComment) {
        selectedComment.selected = !selectedReply
        this.selectedComment = selectedComment
        // Set the icon arrow position based on lineY and offsets
        this.commentHeightPos = this.getCommentDisplayY(selectedComment)

        if (selectedReply) {
          selectedReply.selected = true
          this.selectedReply = selectedReply
        } else {
          // Reset selected reply
          this.selectedReply = <EdjiComment>{}
        }
      }
      // Toggle the variable that controls comment pane open/close so we can add a class to "push" screen over
      // Tell pane to open
      this.commentPane = true
      this._projects.commentPaneStateSubj.next(true)
    } else {
      // Clear Comment ID/deep link params
      this.clearQueryParams()
      // iOS selection
      let selec = Rangy.getSelection()
      selec.removeAllRanges()
      // Tell comments to close
      this.commentPane = false
      // reset our icon arrow position
      this.commentHeightPos = 0
      this._projects.commentPaneStateSubj.next(false)
      // Run the standard comment inactivation to reset variables and do things like close the Keyboard
      this.inactivateComment()
    }
  }

  /**
   * Calculate rendered y position of comment (absolute to body)
   * @param comment comment for which you need the real display y position of
   */
  public getCommentDisplayY(comment: EdjiComment): number {
    let commentIcon = document.querySelector('.w[index="' + comment.start + '"]')
    if (commentIcon) {
      let commentTop = commentIcon.getBoundingClientRect().top
      let bodyTop = document.body.getBoundingClientRect().top
      // Set adjustment for text lines
      let adjustment = -0.25 * ALLSPARK.BASELINEHEIGHT
      // Use imageY for image comment position
      if (comment.imageY) {
        adjustment = -0.5 * ALLSPARK.BASELINEHEIGHT + comment.imageY
      }
      return commentTop - bodyTop + adjustment
    } else {
      return 0
    }
  }

  // Deletes comment via Project service, which updates the local Project object
  public deleteComment(comment: any): void {
    // Stop the user from continuing to edit, and close emoji keyboard
    // Sort through the comment types and do the apppropriate pre-delete action

    if (this._comments.commentContext !== 'answer') {
      this._projects
        .deleteComment(comment)
        .then(data => {
          // Tell the modal to close on successful delete
          this._comments.commentDeleted()
        })
        .catch(error => {
          this.inactivateComment()
          console.error(error)
        })
    } else {
      this._projects
        .deleteAnswer(comment)
        .then(data => {
          this._projects.removeAnswerFromAnswers(comment)
          // Tell the modal to close on successful delete
          this._comments.commentDeleted()
        })
        .catch(error => {
          this.inactivateComment()
          console.error(error)
        })
    }
  }

  /**
   * Method for adding the reply _id to the replies property on a parent comment
   * IMPORTANT for being able to delete all replies under a comment when deleting
   * the comment (if user does not refresh reading first before deleting)
   * @param comment the reply comment that was just created
   */
  private addReplyToComment(comment: any): void {
    let projCommentsLen = this.project.comments.length
    // Add comment to local project array
    for (let i = 0; i < projCommentsLen; i++) {
      let projComment = this.project.comments[i]
      if (projComment._id === comment.reply_to) {
        projComment.replies.push(comment._id)
      }
    }
  }

  /**
   * Method for removing the comment _ids of the reply comments for a parent's replies
   * @param comment the parent comment that was just deleted
   */
  private removeRepliesFromComments(comment: any): void {
    let projCommentsLen = this.project.comments.length
    let replyIds = comment.replies
    // Add comment to local project array
    for (let i = 0; i < projCommentsLen; i++) {
      let projComment = this.project.comments[i]
      if (projComment && projComment._id && replyIds.includes(projComment._id)) {
        this.project.comments.splice(i, 1)
        i--
      }
    }
  }

  // Sets the feedback display for students
  private setFeedback(feedback?: any): void {
    if (!feedback) {
      this.feedbackForUser = this.project.report_evals.filter(feedback => {
        return this.user._id == feedback.user_id
      })
    } else {
      // the socket update needs to have the latest feedback pushed in
      this.feedbackForUser.push(feedback)
    }
  }
}

interface SelectionSpan {
  start: number
  end: number
  boxStart?: number
  boxEnd?: number
}

export type toastType = 'feedback' | 'reply'
