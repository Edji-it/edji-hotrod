import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService } from './auth.service'
import { ProjectService, ReadingService, SocketService } from './'
import { EdjiComment, CommentPermissions, Project } from '../shared/datatypes'
import { ProjectStore } from '../_store'

@Injectable()
export class CommentService {
  private ctx
  private colors
  public emojiActive: boolean
  public activeComment: EdjiComment = <EdjiComment>{}
  public deleteCommentRef: EdjiComment = <EdjiComment>{}
  // public deleteAudioRef: EdjiComment = <EdjiComment>{}
  public showDeleteCommentModal: boolean
  public commentContext: string

  // Deactivate all comments observable
  public clearActiveCommentsSource: Subject<string> = new Subject()
  public clearActiveComments: Observable<string> = this.clearActiveCommentsSource.asObservable()

  // Emoji keyboard insert observable
  public activeInputAppendSource: Subject<string> = new Subject()
  public activeInputAppend: Observable<string> = this.activeInputAppendSource.asObservable()

  /*
  Last Modified: 6 June 2017
  */

  constructor(
    private _readings: ReadingService,
    private projectStore: ProjectStore,
    private _auth: AuthService,
    private _socket: SocketService,
    private angulartics: Angulartics2,
  ) {}

  ngOnInit() {}
  /**
   * Deactivates all Comment Components
   * - Fires clearActiveComments observable
   * @param activeComment comment id to not deactivate
   */
  public deactivateAllComments(activeComment?: string): void {
    this.clearActiveCommentsSource.next(activeComment)
  }

  public deactivateComment(): void {
    if (this.activeComment._id !== undefined) {
      this.activeComment.active = false
      this.activeComment = <EdjiComment>{}
    }
  }

  /**
   * Create the waveform based on the audio comment's amplitude per 0.5 second interval of the comment
   */
  public waveForm(waves, canvas) {
    // Prepare the canvas
    this.ctx = canvas.getContext('2d')

    // Set the properties for this waveform and write it in the barchart function
    barchart({
      canvas: canvas,
      padding: 2,
      gridScale: 5,
      gridColor: 'transparent',
      data: waves,
      colors: ['#666'],
      ctx: this.ctx,
    })

    // Write the waveform in a barchart style
    function barchart(options) {
      // Reset the canvas
      for (bar in options.data) {
        options.ctx.clearRect(
          0,
          0,
          options.canvas.width - options.padding * 2,
          options.canvas.height - options.padding * 2,
        )
      }

      var maxValue = 0
      var minValue = 0

      for (var bar in options.data) {
        if (options.data[bar] < 0) {
          options.data[bar] = Math.abs(options.data[bar])
        }
        maxValue = Math.max(maxValue, options.data[bar])
        minValue = Math.min(minValue, options.data[bar])
      }

      // let avgValue = (minValue + maxValue)/2
      let lowerThird = (minValue + maxValue) / 3
      let midThird = lowerThird * 2

      var canvasActualHeight = options.canvas.height - options.padding * 2
      var canvasActualWidth = options.canvas.width - options.padding * 2

      // drawing the bars
      var barIndex = 0
      var numberOfBars = Object.keys(options.data).length
      var barSize = canvasActualWidth / numberOfBars

      for (bar in options.data) {
        var val = options.data[bar]
        if (val === 0) {
          val = 4
        }
        if (val < lowerThird) {
          val = val / 2
        } else if (val < midThird) {
          val = val / 1.5
        }
        var barHeight = Math.round(canvasActualHeight * (val / maxValue))

        drawBar(
          options.ctx,
          options.padding + barIndex * barSize,
          options.canvas.height / 2,
          barSize,
          barHeight,
          options.colors[barIndex % options.colors.length],
        )
        barIndex++
      }
    } // function barchart(options)

    // Draw the individual bar at the specific part of chart with the specific height. It will be mirrored vertically about the middle of the chart
    function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color) {
      ctx.save()
      ctx.fillStyle = color
      ctx.fillRect(upperLeftCornerX, upperLeftCornerY - height, width, 2 * height)
      ctx.restore()
    } // function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height,color)
  } // // public waveForm(waves, canvas)

  /** Used to determine which level of permission the user has for a specific comment
   * @param comment A comment object
   * @param user A user object
   * @param project A project object
   */
  public getCommentPermissions(commentUser: any, user: any, project: Project): number {
    if (!commentUser || !user) {
      // Fallback to read-only
      return CommentPermissions.READ
    } else if (user._id == commentUser) {
      return CommentPermissions.EDIT
    } else if (project && project.isTeaching) {
      return CommentPermissions.DELETE
    } else {
      return CommentPermissions.READ
    }
  } // public getCommentPermissions

  /**
   * Decides if the Emoji Keyboard is active
   */
  public setEmojiActive(value?: boolean) {
    if (value !== undefined) {
      this.emojiActive = value
    } else {
      this.emojiActive = true
    }
  }

  public emitInputToActive(shortCode: string) {
    this.activeInputAppendSource.next(shortCode)
  }

  /**
   * This method will open the delete confirmation modal that lives on the annotator and set the comment reference
   * Comment deletion is triggered from within the comment component, but the modal for confirmation lives in the annotator for better display purposes
   * @param comment the comment we're looking to delete
   * @param commentContext type of comment: normal, reply, or answer
   */
  public deleteCommentConfirmation(comment: EdjiComment, commentContext: string): void {
    this.showDeleteCommentModal = true
    this.deleteCommentRef = comment
    this.commentContext = commentContext
  }

  /**
   * When the modal is closed either through the user accepting the delete or just closing it, we'll tell the modal to close and reset our reference variables
   */
  public commentDeleted(): void {
    this.showDeleteCommentModal = false
    this.deleteCommentRef = <EdjiComment>{}
    this.commentContext = 'comment'
  }

  /**
   * Saves updates to comments
   * @param comment Full EdjiComment object
   */
  public updateComment(comment: EdjiComment): void {
    if (this.commentContext !== 'answer') {
      this.projectStore
        .saveComment(comment)
        .then(comment => {})
        .catch(error => {
          console.error(error)
        })
    } else {
      this.projectStore.addAnswerToAnswers(comment)
      this.projectStore
        .saveAnswer(comment)
        .then(answer => {
          this.projectStore.addAnswerToAnswers(answer)
        })
        .catch(error => {
          console.error(error)
        })
    }
  }

  /**
   * Returns true if comment is a fresh, empty comment
   * @param comment EdjiComment in question
   */
  public isCommentNewDraft(comment: EdjiComment): boolean {
    return (!comment.data || comment.data == '') && (!comment.url || comment.url == '')
  }

  /**
   * Returns whether the author is currently a teacher
   */
  public isAuthorTeacher(project, comment): boolean {
    return (
      comment.user_id === project.teacher_id ||
      (project.co_owner_ids && project.co_owner_ids.indexOf(comment.user_id) > -1)
    )
  }
}
