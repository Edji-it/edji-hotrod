import { Component, Input, OnInit } from '@angular/core'

import { EdjiComment } from '../../shared/datatypes'

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

  constructor() {
    
  }

  public intializeAudio() {
    const onSuccess = stream => {
      this.mediaRecorder = new MediaRecorder(stream)
      // stream.getTracks()[0].stop()
      this.mediaRecorder.onstart = e => {
        // stream.addTrack()
        console.log('recording has successfully started')
      }
      this.mediaRecorder.onstop = e => {
        this.audio = new Audio()
        console.log(this.audio)
        const blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' })
        this.chunks.length = 0
        this.audio.src = window.URL.createObjectURL(blob)
        this.audio.load()
        this.audio.play()
        console.log('recording has successfully stopped')
        // stream.getTracks()[0].stop()
      }

      this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data)
      this.record()
    };

    navigator.getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia)

    navigator.getUserMedia({ audio: true }, onSuccess, e => console.log(e))
  }

  public record() {
    this.isRecording = true
    this.isPlaying = false
    this.mediaRecorder.start()
  }

  public stop() {
    this.isRecording = false
    this.isPlaying = false
    this.mediaRecorder.stop()
  }

  private play() {
      this.isPlaying = !this.isPlaying
      this.isRecording=false
      this.audio.play()
  }
  
  ngOnInit() {
    // Set the canvas properties and write temporary data
    var waves = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,12,14,22,32,10,12,28,46,89,10,12,14,22,32,10,12,28,46,89,10,12,14,22,32,10,12,28,46,89,0,0,0,0,0,0,0,0,0,0]
    this.myCanvas = document.getElementById("0001")
    //this.myCanvas = document.getElementById(this.comment._id)

    // Build the waveform
    this.waveForm(waves, this.myCanvas)
    //this.waveForm(comment.waveform, comment.)

    this.intializeAudio()
  }

  private loadAudio() {
      
  }

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