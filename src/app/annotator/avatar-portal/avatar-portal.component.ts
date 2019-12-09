import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs'
import { EdjiComment } from '../../shared/datatypes'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, CommentService } from '../../_services'
import { ProjectStore } from 'src/app/_store'
import { ALLSPARK } from 'src/app/app.constants'

enum playState {
  inactive,
  loading,
  playing,
  recording,
}

@Component({
  selector: 'avatar-portal',
  templateUrl: './avatar-portal.component.pug',
  styleUrls: ['./avatar-portal.component.scss'],
})
export class AvatarPortalComponent implements OnInit, OnDestroy {
  public subscriptions: Subscription[] = []
  public repliesById: any = {}
  public commentsByPos: any = []
  public currentState: playState = playState.inactive
  public audio
  public active: boolean = false
  // Used to show loading
  public loading: boolean = false

  public lineY: number
  public setLineYAttempts: number

  public lineCount: number = 1
  /**
   * isActive
   * - Activation property reflecting the comment activation
   * - Display only for portal, and can be manipulated as needed within component
   */
  @Input()
  set isActive(isActive: boolean) {
    if (typeof isActive !== 'undefined' && this.active !== isActive) {
      this.active = isActive
      // Open comment on creation
      if (isActive) {
        if (this.comment && this.comment.new) {
          this.triggerCommentPane(true)
        } else if (!this.comment) {
          this.loading = true
        }
      }
    }
  }
  get isActive(): boolean {
    return this.active
  }
  // Handle comment explorer de-activation
  private _explorerActive: boolean
  @Input()
  set commentExplorerActive(active: boolean) {
    if (!active && this._explorerActive !== active) {
      // Clear portal activation when explorer closed
      this.active = false
    }
    this._explorerActive = active
  }
  get commentExplorerActive(): boolean {
    return this._explorerActive
  }
  // Comment represented by portal
  private _comment: EdjiComment
  @Input()
  set comment(comment: EdjiComment) {
    this._comment = comment
    if (this.loading) {
      this.loading = false
      this.triggerCommentPane(true)
    }
  }
  get comment(): EdjiComment {
    return this._comment
  }
  public indexOnLine: Number = 1

  @Output() toggleCommentPane = new EventEmitter()
  @ViewChild('scrollEl', { static: false }) public scrollEl: ElementRef

  constructor(
    private projectStore: ProjectStore,
    private angulartics: Angulartics2,
    private _auth: AuthService,
    public _comments: CommentService,
  ) {}

  ngOnInit() {
    // If comment already has uploaded audio, load it
    if (this.comment.type == 'audio' && this.comment.url && this.comment.url.length > 0) {
      this.loadAudioPlayer(this.comment.url)
    }
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
      this.projectStore.commentByPos.subscribe(commentsByPos => {
        this.commentsByPos = commentsByPos
        this.updateLineCount()
      }),
    )
  }

  public triggerCommentPane(selected?: boolean) {
    // When displaying in comment pane, comment MUST have line y
    if (!this.comment.lineY) {
      this.setLineY()
      this.projectStore.buildCommentsByPos()
    }
    // If the avatar is the 8th where it shows '+' and number of comments
    if (this.indexOnLine >= 8) {
      selected = false
    }
    // If selected is true then we will have the comment pane scroll to the comment the user clicked on
    if (!selected) {
      // Set as active
      this.active = true
    }
    this.toggleCommentPane.emit(selected)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
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

  private loadAudioPlayer(url: string) {
    // Fresh audio object
    this.audio = new Audio()
    this.audio.preload = 'none'
    this.audio.src = url
    this.audio.load()

    this.audio.onplay = e => {
      this.currentState = playState.playing
    }

    this.audio.onended = e => {
      this.currentState = playState.inactive
    }
  }

  /**
   * Pause playback of the audio track
   */
  private pause() {
    // Let analytics know user paused playback
    this.currentState = playState.inactive
    this.audio.pause()
  }

  /**
   * Start playback of the audio track
   */
  private play() {
    // Let analytics know user started playback
    let commentContext = 'comment'
    if (this.comment.reply_to && this.comment.reply_to !== '') {
      commentContext = 'reply'
    } else if (this.comment.questionId && this.comment.questionId !== '') {
      commentContext = 'answer'
    }
    this.angulartics.eventTrack.next({
      action: commentContext + '_audio_play',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    this.currentState = playState.playing
    this.audio.play()
  }

  /**
   * Play state convenience functions
   */
  isInactive(): boolean {
    return this.currentState == playState.inactive
  }
  isPlaying(): boolean {
    return this.currentState == playState.playing
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
}
