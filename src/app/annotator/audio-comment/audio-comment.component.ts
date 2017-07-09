import { CommentService } from '../../shared/comment.service';
import { MediaService } from '../../shared/media.service'
import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core'

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
  @Output() showDeleteAudioModal: EventEmitter<any> = new EventEmitter<boolean>()

  private isPlaying: boolean = false
  private isRecording: boolean = false
  private recordOverConfirmed: boolean = false
  private playTime: string = "0px"
  private playWidth: number = 82
  private myCanvas
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
  private initWaves = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  private waves;
  private wavePos: number = 0
  // Change the next variable to control maximum audio comment length in milliseconds
  private timeLimit: number = 30000
  // Change the next variable to control the frequency at which the playback/recording currentTime evaluates
  private intervalGap: number = 500
  private isInitialized: boolean = false
  private countdown: boolean = false
  private countdownText: string = ''
  private countdownI: number = 3
  private countdownInterval: any

  // We need to know when changes to inactive to clear the editing variable
  @Input() set active(active){
    this.activated = active
    if (!active && this.audioFile) {
      this.waves = [].concat(this.initWaves)
      this.chunks = []
      this.wavePos = 0
      this.initializeAudio()
    }
    if (!active && this.isRecording) {
      this.stopRecord()
    }
  }
  get active() {
    return this.activated
  }

  // Once we confirm that we're ready to delete and record new audio, let's do it
  @Input() set recordNewAudio(confirmed) {
    this.recordOverConfirmed = confirmed

    if (this.isInitialized && this.recordOverConfirmed) {
      this.record()
    }
  }

  constructor(
    private _media: MediaService,
    private el: ElementRef,
    private _comments: CommentService
  ) {
    
  }
  
  ngOnInit() {
    this.waves = [].concat(this.initWaves)
    this.myCanvas = this.el.nativeElement.querySelector('.wave-form')
    // If comment already has uploaded audio, load it
    if (this.comment.url && this.comment.url.length > 0) {
      this.audio = new Audio()
      this.audio.src = this.comment.url
      this.audio.load()
      this.playAble = true
      // Build the waveform
      this._comments.waveForm(this.comment.dataArray, this.myCanvas)
      this.isInitialized = true
    } else {
      // Set the canvas properties and write temporary data
      this._comments.waveForm(this.waves, this.myCanvas)
    }
    /** 
     * Initialize the audio access request & setup once this component loads
     * Will only load if the user creates an audio comment, or loads text with audio comments in it already
     * Both of which we need to get access granted in order to run 
     */
    this.initializeAudio()
  }

  public initializeAudio() {
    const onSuccess = stream => {
      // Initialize a MediaRecorder if access to the microphone is granted
      this.mediaRecorder = new MediaRecorder(stream)
      this.mediaRecorder.onstart = e => {
        // While recording, check the duration of the recording total and stop it once it hits the limit
        this.rInterval = setInterval(()=> {
          if((new Date().getTime() - this.rStartAt + (this.rDuration * 1000)) > this.timeLimit - 1) {
            this.stopRecord()
            clearInterval(this.rInterval)
            return
          }
          // While recording, set the playTime to indicate current % progress of recording
          // this.playTime = (((this.rDuration * 1000 + (new Date().getTime() - this.rStartAt)) / this.timeLimit) * this.playWidth) + 'px'
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

        // Comment saved! Save audio file
        this._media.uploadAudio(this.audioFile)
          .take(1)
          .subscribe(data => {
            this.audio.src = data.url

            // Save to comment
            this.comment.url = data.url
            this.comment.dataArray = this.waves
            this.save.emit(this.comment)
          })

        // Set the playTime to indicate current % progress of playback
        // this.audio.onplay = e => {
        //   this.playTime = '0px'
        //   this.pInterval = setInterval(()=> {
        //     if((new Date().getTime() - this.pStartAt) > this.rDuration * 1000 - 1) {
        //       // this.pause()
        //       clearInterval(this.pInterval)
        //       return
        //     }
        //     this.playTime = (((new Date().getTime() - this.pStartAt) / this.timeLimit) * this.playWidth) + 'px'
        //   }, this.intervalGap)
        // }
        
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
        this._comments.waveForm(this.waves, this.myCanvas)
      }
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
   * Call for audio deletion or call for a fresh recording sesh
   */
  private record() {
    if (this.recordOverConfirmed) {
      this.freshRecord()
    } else if (this.audio && this.audio.src && this.audio.src.length > 0) {
      this.showDeleteAudioModal.emit(true)
    } else {
      this.freshRecord()
    }
  }

  /** 
   * Record Audio from the user's microphone
   */
  private freshRecord() {
    this.countdownText = '----- 3 -----'
    this.countdown = true
    this.countdownInterval = setInterval(()=> {
      this.countdownText = '----- ' + this.countdownI + ' -----'
      this.countdownI--
    }, 1000)
    setTimeout(() => {
      clearInterval(this.countdownInterval)
      this.countdownInterval = ''
      this.countdownI = 3
      this.countdown = false
      this.playAble = false
      this.isRecording = true
      this.isPlaying = false
      this.rStartAt = new Date()
      this.mediaRecorder.start(this.intervalGap)
    }, 3000)
    
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
    // this.playTime = '0px'
    this.mediaRecorder.stop()
  }

  /** 
   * Pause playback of the audio track
   */
  private pause() {
    this.isPlaying = false
    // clearInterval(this.pInterval)
    // this.playTime = '0px'
    this.audio.pause()
  }

  /** 
   * Start playback of the audio track
   */
  private play() {
    this.recordAble = false
    this.isPlaying = true
    this.isRecording=false
    // this.pStartAt = new Date()
    this.audio.play()
  }

  private getPlayhead() {
    return Math.round((this.audio.currentTime / 30) * 75)
  }
  
  /**
   * Set the playback back to the beginning #back2basics
   */
  private restartPlayback() {
    this.audio.load()
  }

  private setPlaybackTime(event) {
    console.log(event)
    let percentLeftClicked = event.offsetX/75
    this.audio.currentTime = 30 * percentLeftClicked
  }
}