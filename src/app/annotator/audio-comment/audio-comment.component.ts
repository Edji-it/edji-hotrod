import { Angulartics2 } from 'angulartics2/dist'
import { CommentService } from '../../shared/comment.service'
import { MediaService } from '../../shared/media.service'
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { EdjiComment } from '../../shared/datatypes'
import * as Recorder from 'opus-recorder/dist/recorder.min.js'

// declare var MediaRecorder: any
declare var window: any

@Component({
  selector: 'audio-comment',
  templateUrl: 'audio-comment.component.pug',
  styleUrls: ['./audio-comment.component.scss']
})
export class AudioCommentComponent implements OnInit, AfterViewInit{
  @Input() private comment: EdjiComment
  @Input() private userPermission: number
  @Input() private reply: boolean = false
  @Output() save: EventEmitter<any> = new EventEmitter<any>() 
  @Output() showDeleteAudioModal: EventEmitter<any> = new EventEmitter<boolean>()

  private isPlaying: boolean = false
  private isRecording: boolean = false
  private recordOverConfirmed: boolean = false
  private playTime: string = "0px"
  private playWidth: number = 130
  private playWidthVisual: number
  private pausedWidth: number
  private myCanvas
  private chunks: any = []
  // private mediaRecorder: any
  private recorder: any

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
  private initWaves = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  private waves;
  private wavePos: number = 0
  // Change the next variable to control maximum audio comment length in milliseconds
  private timeLimit: number = 30000
  // Change the next variable to control the frequency at which the playback/recording currentTime evaluates
  private intervalGap: number = 500
  private isInitialized: boolean = false
  private countdown: boolean = false
  private countdownI: number = 3
  private countdownText: string[] = ['--- Go! ---', '--- Set ---', '-- Ready --']
  private countdownInterval: any
  private audioType: string = 'wav'
  private audioTypeExt: string = 'wav'
  // private audioType: string = 'aac'
  // private audioTypeExt: string = 'aac'

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
    private _comments: CommentService,
    private angulartics: Angulartics2
  ) {
    
  }
  
  ngOnInit() {
    this.waves = [].concat(this.initWaves)
    this.myCanvas = this.el.nativeElement.querySelector('.wave-form')
    // If comment already has uploaded audio, load it
    if (this.comment.url && this.comment.url.length > 0) {
      this.audio = new Audio()
      this.audio.src = this.comment.url
      this.audio.preload = 'none'
      this.audio.load()
      this.playAble = true
      // Build the waveform
      this._comments.waveForm(this.comment.dataArray, this.myCanvas)
      this.isInitialized = true
    } else {
      // Set the canvas properties and write temporary data
      this._comments.waveForm(this.waves, this.myCanvas)
    }

    if (this.userPermission > 3) {
      this.playWidth = this.playWidth - 55
    } else if (this.userPermission == 3) {
      this.playWidth = this.playWidth - 30
    }
    /** 
     * Initialize the audio access request & setup once this component loads
     * Will only load if the user creates an audio comment, or loads text with audio comments in it already
     * Both of which we need to get access granted in order to run 
     */
    if (Recorder.isRecordingSupported()) {
      this.recorder = new Recorder({
        type: 'audio/x-wav',
        encoderPath: '/assets/js/waveWorker.min.js',
        streamPages: true
      })
      this.recorder.initStream()
      this.initializeAudio()
    }

    // Safari needs warming
    // this.warmUpAudioContext()
  }

  ngAfterViewInit(){
    setTimeout(_=> this.setplayWidthVisual())
  }

  // warmUpAudioContext() {
  //     window.AudioContext = window.AudioContext || window.webkitAudioContext;
  //   if (window.AudioContext) {
  //     window.audioContext = new window.AudioContext();
  //   }
  //   var fixAudioContext = function (e) {
  //     if (window.audioContext) {
  //       // Create empty buffer
  //       var buffer = window.audioContext.createBuffer(1, 1, 22050);
  //       var source = window.audioContext.createBufferSource();
  //       source.buffer = buffer;
  //       // Connect to output (speakers)
  //       source.connect(window.audioContext.destination);
  //       // Play sound
  //       if (source.start) {
  //         source.start(0);
  //       } else if (source.play) {
  //         source.play(0);
  //       } else if (source.noteOn) {
  //         source.noteOn(0);
  //       }
  //     }
  //     // Remove events
  //     document.removeEventListener('touchstart', fixAudioContext);
  //     document.removeEventListener('touchend', fixAudioContext);
  //   };
  //   // iOS 6-8
  //   document.addEventListener('touchstart', fixAudioContext);
  //   // iOS 9
  //   document.addEventListener('touchend', fixAudioContext);
  // }

  public initializeAudio() {
    
    console.log(this.recorder)
    // const onSuccess = stream => {
    //   // Initialize a MediaRecorder if access to the microphone is granted
    this.recorder.addEventListener('streamError', (err) => {
      console.log(err)
    })
    
    //   this.mediaRecorder = new MediaRecorder(stream)
      this.recorder.addEventListener('start', () => {
        console.log("Recording started!")
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
      })

      this.recorder.addEventListener('stop', () => {
        // If the audio is at the limit, restrict the ability to record
        // if (this.rDuration > this.timeLimit / 1000) {
          this.recordAble = false
        // }

        // Initialize an audio object after the recording has stopped
        this.audio = new Audio()

        // Set the audio for playback via the blob object from the stored chunks
        //var binary = this.convertDataURIToBinary(this.chunks)
        const blob = new Blob(this.chunks, { 'type': 'audio/' + this.audioType + '; codecs="wav"' })
        
        var file = new File([blob], 'my-audio.' + this.audioTypeExt, {
            type: 'audio/x-wav'
        });
        
        this.audioFile = file
        // this.audio.load()

        // document.getElementById('audioPlay').onclick = (e) => {
          this.audio.preload = 'none'
          
          // No longer loading blob, doesn't work in Safari and in other cases
          // this.audio.src = window.URL.createObjectURL(blob)

          // this.audio.play()
          //   .then(data => {
          //     console.log(data)
          //   })
          //   .catch(err => {
          //     console.log(err)
          //   })
        // }

        // Comment saved! Save audio file
        this._media.uploadAudio(this.audioFile)
          .take(1)
          .subscribe(data => {
            console.log(data)
            this.audio.src = data.url
            this.isInitialized = true

            // Save to comment
            this.comment.url = data.url
            this.comment.dataArray = this.waves
            this.save.emit(this.comment)
          })

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

        this.addOnEndEvent()
      })

    //   // Send "chunks" to the array as they are recorded
      this.recorder.addEventListener('dataAvailable', (e) =>{
        console.log('data available!')
        console.log(e)
        this.chunks.push(e.detail)
        this.waves[this.wavePos] = e.detail.length - 3200
        this.wavePos++
        this._comments.waveForm(this.waves, this.myCanvas)
      })
      
      

    //   // Clear the playing element and allow recording once audio clip has finished playing
    //   if (this.audio) {
    //     this.addOnEndEvent()
    //   }
    // }
    // const onError = e => {
    //   this.audioError()
    
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
    console.log("fresh record")
    // Let analytics know a recording started
    // this.angulartics.eventTrack.next({ action: 'audioRecord', properties: { category: 'heroFeature', label: 'success' }})
    if (this.isRecording) {
      this.recorder.stop()
    }
   

    // this.countdown = true
    // this.countdownInterval = setInterval(()=> {
    //   this.countdownI--
    // }, 800)
    this.playAble = false
    this.isPlaying = false
    // setTimeout(() => {
    //   clearInterval(this.countdownInterval)
      this.countdownInterval = ''
      this.countdownI = 2
      this.countdown = false
      this.isRecording = true
      this.rStartAt = new Date()
      this.recorder.start()
        // .then( data => {
        //   console.log(data)
        // })
        // .catch( err => {
        //   console.log(err)
        // })
    // }, 3000)
    
  }

  /** 
   * Stop recording audio
   */
  private stopRecord() {
    console.log("STOP!")
    this.playAble = true
    this.isRecording = false
    this.isPlaying = false
    // // Get the duration of the audio track
    this.rDuration = this.rDuration + (new Date().getTime() - this.rStartAt) / 1000
    // clearInterval(this.rInterval)
    this.playTime = '0px'
    this.recorder.stop()
  }

  /** 
   * Pause playback of the audio track
   */
  private pause() {
    // Let analytics know user paused playback
    this.angulartics.eventTrack.next({ action: 'audioPause', properties: { category: 'heroFeature', label: 'success' }})
    this.isPlaying = false
    this.recordAble = true
    // clearInterval(this.pInterval)
    // this.playTime = '0px'
    this.audio.pause()
  }

  /** 
   * Start playback of the audio track
   */
  private play() {
    // Let analytics know user started playback
    this.angulartics.eventTrack.next({ action: 'audioPlay', properties: { category: 'heroFeature', label: 'success' }})
    this.recordAble = false
    this.isPlaying = true
    this.isRecording=false
    // this.pStartAt = new Date()
    console.log(this.audio)
    
    this.audio.play().then( () => {
            
      }).catch((error) => {
         console.log("auto play failed!")
      })
  }

  private getPlayhead() {
    this.pausedWidth = Math.round((this.audio.currentTime / 30) * this.playWidthVisual)
    return Math.round((this.audio.currentTime / 30) * this.playWidthVisual)
  }
  
  /**
   * Set the playback back to the beginning #back2basics
   */
  private restartPlayback() {
    // Let analytics know user restarted playback
    this.angulartics.eventTrack.next({ action: 'audioRestart', properties: { category: 'heroFeature', label: 'success' }})
    this.audio.load()
  }

  private setPlaybackTime(event) {
    let percentLeftClicked = event.offsetX/this.playWidthVisual
    if (this.audio) {
      this.audio.currentTime = 30 * percentLeftClicked
    }
  }

  private audioError() {
    // console.log('this device is not supported for audio recording')
  }

  private getPlayhead_exp() : number {
    if (this.audio) {
      return Math.round((this.audio.currentTime / 30) * this.playWidthVisual)
    } else {
      return 0
    }
  }

  private addOnEndEvent(): void {
    this.audio.onended = e => {
      this.recordAble = true
      this.isPlaying = false
    }
  }

  private setplayWidthVisual() {
    // Get the width of the audio canvas
    if (this.el.nativeElement.querySelector('.reply-wave')) {
      this.playWidthVisual = this.el.nativeElement.querySelector('.wave-form').getBoundingClientRect().width
    } else {
      this.playWidthVisual = this.playWidth
    }
  }
}