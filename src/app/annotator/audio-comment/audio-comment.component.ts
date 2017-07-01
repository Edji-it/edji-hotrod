import { MediaService } from '../../shared/media.service';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { EdjiComment } from '../../shared/datatypes'

declare var MediaRecorder: any

@Component({
  selector: 'audio-comment',
  templateUrl: 'audio-comment.component.html',
  styleUrls: ['./audio-comment.component.scss']
})
export class AudioCommentComponent implements OnInit{
  @Input() private comment: EdjiComment
  @Output() save: EventEmitter<any> = new EventEmitter<any>() 

  private isPlaying: boolean = false
  private isRecording: boolean = false
  private playTime: string = "0px"
  private playWidth: number = 82
  private myCanvas
  private options
  private canvas
  private ctx
  private colors
  private chunks: any = []
  private mediaRecorder: any
  private audio
  private audioFile
  private playAble: boolean = false
  private recordAble: boolean = false
  private activated: boolean = false
  private rStartAt: any
  private rDuration: number = 0
  private pStartAt: any
  private pDuration: number = 0
  private rInterval: any
  private pInterval: any
  private waves = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  private wavePos: number = 0
  // Change the next variable to control maximum audio comment length in milliseconds
  private timeLimit: number = 30000
  // Change the next variable to control the frequency at which the playback/recording currentTime evaluates
  private intervalGap: number = 500

  // We need to know when changes to inactive to clear the editing variable
  @Input() set active(active){
    this.activated = active
    if (active == false && this.audioFile) {
      // Comment saved! Save audio file
      this._media.uploadAudio(this.audioFile)
        .take(1)
        .subscribe(data => {
          console.log(data)
          this.audio.src = data.url

          // Save to comment
          this.comment.url = data.url
          this.comment.dataArray = this.waves
          this.save.emit(this.comment)
        })
    }
  }
  get active() {
    return this.activated
  }

  constructor(
    private _media: MediaService,
    private el: ElementRef
  ) {
    
  }
  
  ngOnInit() {
    this.myCanvas = this.el.nativeElement.querySelector('.wave-form')
    // If comment already has uploaded audio, load it
    if (this.comment.url && this.comment.url.length > 0) {
      console.log(this.comment.url)
      this.audio = new Audio()
      this.audio.src = this.comment.url
      this.audio.load()
      this.playAble = true
      // Build the waveform
      this.waveForm(this.comment.dataArray, this.myCanvas)
    } else {
      // Set the canvas properties and write temporary data
      this.waveForm(this.waves, this.myCanvas)
    }
    /** 
     * Initialize the audio access request & setup once this component loads
     * Will only load if the user creates an audio comment, or loads text with audio comments in it already
     * Both of which we need to get access granted in order to run 
     */
    this.intializeAudio()
  }

  public intializeAudio() {
    const onSuccess = stream => {
      // Initialize a MediaRecorder if access to the microphone is granted
      this.mediaRecorder = new MediaRecorder(stream)
      this.mediaRecorder.onstart = e => {
        console.log('recording has successfully started')
        // While recording, check the duration of the recording total and stop it once it hits the limit
        this.rInterval = setInterval(()=> {
          if((new Date().getTime() - this.rStartAt + (this.rDuration * 1000)) > this.timeLimit - 1) {
            this.stopRecord()
            clearInterval(this.rInterval)
            return
          }
          // While recording, set the playTime to indicate current % progress of recording
          this.playTime = (((this.rDuration * 1000 + (new Date().getTime() - this.rStartAt)) / this.timeLimit) * this.playWidth) + 'px'
        }, this.intervalGap)
      }
      this.mediaRecorder.onstop = e => {
        // If the audio is at the limit, restrict the ability to record
        if (this.rDuration > this.timeLimit / 1000) {
          this.recordAble = false
        }

        // Initialize an audio object after the recording has stopped
        this.audio = new Audio()

        // Set the audio for playback via the blob object from the stored chunks
        const blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' })
        
        var file = new File([blob], 'my-audio.ogg', {
            type: 'audio/ogg'
        });
        
        this.audioFile = file
        this.audio.src = window.URL.createObjectURL(blob)
        this.audio.load()

        console.log('recording has successfully stopped')

        // Set the playTime to indicate current % progress of playback
        this.audio.onplay = e => {
          this.playTime = '0px'
          this.pInterval = setInterval(()=> {
            if((new Date().getTime() - this.pStartAt) > this.rDuration * 1000 - 1) {
              // this.pause()
              clearInterval(this.pInterval)
              return
            }
            this.playTime = (((new Date().getTime() - this.pStartAt) / this.timeLimit) * this.playWidth) + 'px'
          }, this.intervalGap)
        }
        
        // Clear the playing element and allow recording once audio clip has finished playing
        this.audio.onended = e => {
          this.recordAble = true
          this.isPlaying = false
        }
      }

      // Send "chunks" to the array as they are recorded
      this.mediaRecorder.ondataavailable = e => {
        this.chunks.push(e.data)
        this.waves[this.wavePos] = e.data.size - 3200
        this.wavePos ++
        this.waveForm(this.waves, this.myCanvas)
      }
      console.log('audio initialized')
    }

    // Request access to the microphone from the user
    navigator.getUserMedia = (navigator.getUserMedia ||
      navigator['webkitGetUserMedia'] ||
      navigator['mozGetUserMedia'] ||
      navigator['msGetUserMedia'])

    // If the user allows access to the microphone, run the onSuccess function and enable the record button
    navigator.getUserMedia({ audio: true }, onSuccess, e => {})
    this.recordAble = true
  }

  /** 
   * Record Audio from the user's microphone
   */
  private record() {
    this.playAble = false
    this.isRecording = true
    this.isPlaying = false
    this.rStartAt = new Date()
    this.mediaRecorder.start(this.intervalGap)
  }

  /** 
   * Stop recording audio
   */
  private stopRecord() {
    this.playAble = true
    this.isRecording = false
    this.isPlaying = false
    // Get the duration of the audio track
    this.rDuration = this.rDuration + (new Date().getTime() - this.rStartAt) / 1000
    clearInterval(this.rInterval)
    this.playTime = '0px'
    console.log(this.rDuration)
    this.mediaRecorder.stop()
  }

  /** 
   * Pause playback of the audio track
   */
  private pause() {
    this.isPlaying = false
    clearInterval(this.pInterval)
    this.playTime = '0px'
    this.audio.pause()
  }

  /** 
   * Start playback of the audio track
   */
  private play() {
    this.recordAble = false
    this.isPlaying = true
    this.isRecording=false
    this.pStartAt = new Date()
    this.audio.play()
  }

  /** 
   * Create the waveform based on the audio comment's amplitude per 0.5 second interval of the comment
   */
  private waveForm(waves, canvas) {
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
        colors: ["#000"],
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

      for (var bar in options.data){
        maxValue = Math.max(maxValue,options.data[bar])
      }
      var canvasActualHeight = options.canvas.height - options.padding * 2
      var canvasActualWidth = options.canvas.width - options.padding * 2

      //drawing the bars
      var barIndex = 0
      var numberOfBars = Object.keys(options.data).length
      var barSize = (canvasActualWidth)/numberOfBars

      for (bar in options.data) {
        var val = options.data[bar]
        if (val===0) {
            val = 2
        }
        var barHeight = Math.round( canvasActualHeight * val/maxValue) 
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
}