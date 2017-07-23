import { EdjiComment, CommentPermissions, Project } from './datatypes';
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AuthService } from './auth.service'
import { ProjectService, ReadingService, SocketService } from './';
import { Angulartics2 } from 'angulartics2/dist'

@Injectable()
export class CommentService {
  private ctx
  private colors
  public keyboardActive: boolean
  public activeComment: EdjiComment = <EdjiComment>{}

  /*
  Last Modified: 6 June 2017
  */

  constructor(
        private _readings: ReadingService,
        private _projects: ProjectService,
        private _auth: AuthService,
        private _socket: SocketService,
        private angulartics: Angulartics2
      ) {
  }

  ngOnInit() {
      
  }

  /** 
   * Create the waveform based on the audio comment's amplitude per 0.5 second interval of the comment
   */
  public waveForm(waves, canvas) {
    // Prepare the canvas
    this.ctx = canvas.getContext("2d")

    // Set the properties for this waveform and write it in the barchart function
    barchart(
      {
        canvas: canvas,
        padding: 2,
        gridScale: 5,
        gridColor: "transparent",
        data: waves,
        colors: ["#666"],
        ctx: this.ctx
      }
    )
    
    // Write the waveform in a barchart style
    function barchart(options) {
      // Reset the canvas
      for (bar in options.data) {
        options.ctx.clearRect(0, 0, options.canvas.width - options.padding * 2, options.canvas.height - options.padding * 2)
      }

      var maxValue = 0
      var minValue = 0

      for (var bar in options.data){
        if (options.data[bar] < 0) {
          options.data[bar] = Math.abs(options.data[bar])
        }
        maxValue = Math.max(maxValue, options.data[bar])
        minValue = Math.min(minValue, options.data[bar])
      }

      // let avgValue = (minValue + maxValue)/2
      let lowerThird = (minValue + maxValue)/3
      let midThird = lowerThird*2
      
      var canvasActualHeight = options.canvas.height - options.padding * 2
      var canvasActualWidth = options.canvas.width - options.padding * 2

      // drawing the bars
      var barIndex = 0
      var numberOfBars = Object.keys(options.data).length
      var barSize = (canvasActualWidth)/numberOfBars

      for (bar in options.data) {
        var val = options.data[bar]
        if (val===0) {
            val = 4
        }
        if (val < lowerThird) {
          val = val/2
        } else if (val < midThird) {
          val = val/1.5
        }
        var barHeight = Math.round( canvasActualHeight * (val/maxValue)) 
        
        drawBar(
          options.ctx,
          options.padding + barIndex * barSize,
          options.canvas.height/2,
          barSize,
          barHeight,
          options.colors[barIndex%options.colors.length]
        )
        barIndex++
      }
    }

    // Draw the individual bar at the specific part of chart with the specific height. It will be mirrored vertically about the middle of the chart
    function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height,color) {
      ctx.save()
      ctx.fillStyle=color
      ctx.fillRect(upperLeftCornerX,upperLeftCornerY - height,width,2*height)
      ctx.restore()
    }
  }

  /** Used to determine which level of permission the user has for a specific comment
   * @param comment A comment object
   * @param user A user object
   * @param project A project object
   */
  public getCommentPermissions(comment: any, user: any, project: Project): number {
    if (user._id == comment.user_id) {
        return CommentPermissions.EDIT
    } else if (user._id == project.teacher_id) {
        return CommentPermissions.DELETE
    } else {
        return CommentPermissions.READ
    }
  }

  /**
   * Decides if the Emoji Keyboard is active
   */
  public isEmojiKeyboardActive(user: any): void {
    if (this.activeComment.type !== 'emoji') {
        this.keyboardActive = false
    } else {
        this.keyboardActive = this.activeComment && (!this.activeComment.type || this.activeComment.type === 'emoji') && this.activeComment.active && this.activeComment.user_id === user._id
    }
  }
}