import { Component, Input, OnInit } from '@angular/core'

import { EdjiComment } from '../../shared/datatypes'

declare var MediaRecorder: any

@Component({
  selector: 'audio-comment',
  templateUrl: 'audio-comment.component.html',
  styleUrls: ['./audio-comment.component.scss']
})
export class AudioCommentComponent implements OnInit{
  @Input() private comment: EdjiComment

  private isPlaying: boolean = false
  private isRecording: boolean = false
  private playTime: string = "75px"
  private myCanvas
  private options
  private canvas
  private ctx
  private colors
  private chunks: any = []
  private mediaRecorder: any
  private audio
  private playAble: boolean = false
  private recordAble: boolean = false
  private activated: boolean = false

  // We need to know when changes to inactive to clear the editing variable
  @Input() set active(active){
    this.activated = active
    if (active == false) {
      // Comment saved! Save audio file
      
    }
  }
  get active() {
    return this.activated
  }

  constructor() {
    
  }
  
  ngOnInit() {
    // Set the canvas properties and write temporary data
    var waves = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,12,14,22,32,10,12,28,46,89,10,12,14,22,32,10,12,28,46,89,10,12,14,22,32,10,12,28,46,89,0,0,0,0,0,0,0,0,0,0]
    this.myCanvas = document.getElementById("0001")
    //this.myCanvas = document.getElementById(this.comment._id)

    // Build the waveform
    this.waveForm(waves, this.myCanvas)
    //this.waveForm(comment.waveform, comment.)

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
      }
      this.mediaRecorder.onstop = e => {
        // Initialize an audio object after the recording has stopped
        this.audio = new Audio()
        console.log(this.audio)

        // Set the audio for playback via the blob object from the stored chunks
        const blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' })
        this.audio.src = window.URL.createObjectURL(blob)
        this.audio.load()

        console.log('recording has successfully stopped')
        
        // Clear the playing element and allow recording once audio clip has finished playing
        this.audio.onended = e => {
          this.recordAble = true
          this.isPlaying = false
        }
        // Get the audio duration 
        // (only is accurate if the track is played at least once right now)
        this.audio.onloadedmetadata = e => {
          console.log(this.audio.duration)
        }
      }

      // Send "chunks" to the array as they are recorded
      this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data)
      console.log('audio initialized')
    };

    // Request access to the microphone from the user
    navigator.getUserMedia = (navigator.getUserMedia ||
      navigator['webkitGetUserMedia'] ||
      navigator['mozGetUserMedia'] ||
      navigator['msGetUserMedia'])

    // If the user allows access to the microphone, run the onSuccess function and enable the record button
    navigator.getUserMedia({ audio: true }, onSuccess, e => console.log(e))
    this.recordAble = true
  }

  /** 
   * Record Audio from the user's microphone
   */
  private record() {
    this.playAble = false
    this.isRecording = true
    this.isPlaying = false
    this.mediaRecorder.start()
  }

  /** 
   * Stop recording audio
   */
  private stopRecord() {
    this.playAble = true
    this.isRecording = false
    this.isPlaying = false
    this.mediaRecorder.stop()
  }

  /** 
   * Pause playback of the audio track
   */
  private pause() {
    this.isPlaying = false
    this.audio.pause()
  }

  /** 
   * Start playback of the audio track
   */
  private play() {
    this.recordAble = false
    this.isPlaying = true
    this.isRecording=false
    this.audio.play()
    console.log(this.audio.duration)
  }

  private loadAudio() {
      
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
        padding:2,
        gridScale:5,
        gridColor:"transparent",
        data: waves,
        colors:["#000"],
        ctx: this.ctx
      }
    )
    
    // Write the waveform in a barchart style
    function barchart(options){
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

      for (bar in options.data){
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
    function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height,color){
      ctx.save()
      ctx.fillStyle=color
      ctx.fillRect(upperLeftCornerX,upperLeftCornerY - height,width,2*height)
      ctx.restore()
    }
  }
}