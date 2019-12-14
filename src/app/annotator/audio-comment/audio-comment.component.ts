import { DomSanitizer } from '@angular/platform-browser'
import { Angulartics2 } from 'angulartics2'
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { take } from 'rxjs/operators'
import * as Recorder from 'opus-recorder/dist/recorder.min.js'

// Project Dependencies
import { EdjiComment } from '../../shared/datatypes'
import { AudioService, CommentService, MediaService, AuthService } from '../../_services'
import { Observable, Subscription } from 'rxjs'

// declare var MediaRecorder: any
declare var window: any
declare var navigator: any

enum playState {
  inactive,
  loading,
  playing,
  recording,
}

@Component({
  selector: 'audio-comment',
  templateUrl: './audio-comment.component.pug',
  styleUrls: ['./audio-comment.component.scss'],
})
export class AudioCommentComponent implements OnInit {
  @Input() public comment: EdjiComment
  @Input() public userPermission: number
  @Input() public reply: boolean = false
  @Input() public commentContext: string = 'normal'
  @Output() save: EventEmitter<any> = new EventEmitter<any>()

  public currentState: playState = playState.inactive

  public confirmClear: boolean = false
  public playTime: number = 0
  public playheadPos: number
  public myCanvas
  public chunks: any = []
  public recorder: any
  public recorderReady: boolean

  public audio
  public audioFile
  public activated: boolean = false
  public rStartAt: any
  public rDuration: number = 0
  public pStartAt: any
  public pDuration: number = 0
  public rInterval: any
  public pInterval: any
  public initWaves = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ]
  public waves
  public wavePos: number = 0
  // Change the next variable to control maximum audio comment length in milliseconds
  public timeLimit: number = 60000
  // Change the next variable to control the frequency at which the playback/recording currentTime evaluates
  private INTERVAL_GAP: number = 500
  private MAX_SECONDS: number = this.timeLimit / 1000

  public isInitialized: boolean = false
  public countdownI: number = -3
  public countdownText: any = {
    '-3': null,
    '-2': 'Ready',
    '-1': 'Set',
    0: 'Go!',
    55: '5 Seconds Left',
    56: '4 Seconds Left',
    57: '3 Seconds Left',
    58: '2 Seconds Left',
    59: '1 Second Left',
  }
  public countdownInterval: any

  private subscriptions: Subscription[] = []

  // We need to know when changes to inactive to clear the editing variable
  @Input() set active(active) {
    this.activated = active
    if (!active && this.currentState == playState.recording) {
      this.stopRecord()
    }
  }
  get active() {
    return this.activated
  }

  constructor(
    private _media: MediaService,
    private el: ElementRef,
    private _comments: CommentService,
    private angulartics: Angulartics2,
    private sanitizer: DomSanitizer,
    // Note: The AudioService is provided at the page level (project page) to be lighter
    private _audio: AudioService,
    private _auth: AuthService,
  ) {}

  ngOnInit() {
    this.myCanvas = this.el.nativeElement.querySelector('.wave-form')
    // Initialize the wave!
    this.newWave()
    // If comment already has uploaded audio, load it
    if (this.comment.url && this.comment.url.length > 0) {
      this.loadAudioPlayer(this.comment.url)
      // Build the waveform
      this.waves = this.comment.dataArray
      this.isInitialized = true
    }
    // Render either initial or saved waveform
    this._comments.waveForm(this.waves, this.myCanvas)
    // Ensure we don't record or play multiple comments at the same time
    this.subscriptions.push(
      this._audio.audioInitiated.subscribe(initiatedId => {
        if (initiatedId != this.comment._id) {
          // Pause Audio
          if (this.currentState === playState.playing) {
            this.pause()
          }
          // Pause Recorder
          if (this.currentState === playState.recording) {
            this.stopRecord()
          }
        }
      }),
    )
  }

  public verifyAudio() {
    // Verify the user has accepted access to the microphone
    if (typeof this._audio.recorder === 'undefined') {
      this._audio.initializeAudio()
    }

    // First press on mic this session triggers mic access request
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        this.startRecording()
      })
      .catch(error => {
        console.error(error)
      })
  }

  public startRecording() {
    this._audio.signalAudioInitiated(this.comment._id)
    // Use shared recorder
    this.recorder = this._audio.recorder
    // When we know we're ready to record, let's prep the audio recorder and start recording audio
    this.initializeAudio()

    this.countdownI = -2
    this.countdownInterval = setInterval(() => {
      this.countdownI++
    }, 800)
    setTimeout(() => {
      clearInterval(this.countdownInterval)
      this.countdownInterval = ''
      // Hide Countdown
      this.countdownI = 0
      this.rStartAt = new Date()
      this.recorder.start()
    }, 2000)
  }

  public initializeAudio() {
    // Clears stream and event listeners from other comments
    this._audio.freshRecorder()

    // Initialize a Recorder.js if access to the microphone is granted
    this._audio.addRecorderListener('streamError', err => {
      console.error(err)
    })

    /**
     * Start Recording event handling
     */
    this._audio.addRecorderListener('start', () => {
      // Clear wave forms (we are assuming each recording is new/fresh)
      this.newWave()
      // Maintain state when we know for sure we are recording
      this.currentState = playState.recording
      // While recording, check the duration of the recording total and stop it once it hits the limit
      this.rInterval = setInterval(() => {
        // While recording, update playTime value
        this.playTime += 0.5
        this.countdownI = Math.floor(this.playTime)
        this.setPlayhead()

        if (this.playTime >= this.MAX_SECONDS) {
          // Hide Countdown
          this.countdownI = -3
          this.stopRecord()
        }
      }, this.INTERVAL_GAP)
    })

    /**
     * Stop Recording event handling
     */
    this._audio.addRecorderListener('stop', () => {
      // Player begins uploading recording on stop
      this.currentState = playState.loading

      // Set the audio for playback via the blob object from the stored chunks
      const blob = new Blob(this.chunks, { type: 'audio/wav; codecs="wav"' })

      var file = new File([blob], 'my-audio.wav', {
        type: 'audio/wav',
      })

      this.audioFile = file

      // Comment saved! Save audio file
      this._media
        .uploadAudio(this.audioFile)
        .pipe(take(1))
        .subscribe(
          data => {
            // Player no longer loading!
            this.currentState = playState.inactive

            this.loadAudioPlayer(data.url)

            // Save to comment
            this.comment.url = data.url
            this.comment.dataArray = this.waves
            this.save.emit(this.comment)
          },
          err => {
            console.error(err)
          },
        )
    })

    /**
     * Data Stream event handling
     * - Saves data to chunks array as it is received
     * - In Chrome, we receive all chunks at the end of recording
     */
    this._audio.addRecorderListener('dataavailable', data => {
      // Save data to create audio file on 'stop'
      this.chunks.push(data)

      // Sample for waves every 500ms
      let detailLength = data.length
      let sampleInterval = detailLength / (this.rDuration * 2)
      for (let i = 0; i < detailLength; i = i + sampleInterval) {
        i = Math.floor(i)
        // Sample for the wave ~~~
        let neighborAvg = ((data[i] || 0) + (data[i + 1] || 0) + (data[i + 2] || 0) + 1) / 3
        this.waves[this.wavePos] = Math.round(neighborAvg)
        this.wavePos++
      }

      this._comments.waveForm(this.waves, this.myCanvas)
    })
  }

  /**
   * Refreshes the waveform data
   */
  private newWave() {
    this.wavePos = 0
    this.waves = [].concat(this.initWaves)
  }

  private loadAudioPlayer(url: string) {
    // Fresh audio object
    this.audio = new Audio(url)
    this.isInitialized = true
    this.audio.preload = 'none'

    this.audio.onplay = e => {
      this.currentState = playState.playing
      this.playTime = 0
      this.pInterval = setInterval(() => {
        this.playTime = this.playTime + this.INTERVAL_GAP
        this.setPlayhead()
      }, this.INTERVAL_GAP)
    }

    this.audio.onended = e => {
      this.currentState = playState.inactive
      this.playTime = 0
      this.playheadPos = 0
      clearInterval(this.pInterval)
    }

    // load() should run after all settings are configured
    this.audio.load()
  }

  /**
   * Resets Audio Comment
   * - Clears component recording variables
   * - Saves comment with removed data
   */
  public clearRecording(): void {
    // Reset playhead
    this.playheadPos = 0
    // Clear variables tied to existing recording
    this.audio.src = this.comment.url = ''
    this.comment.dataArray = []
    // Clear wave data
    this.newWave()
    // Update wave display
    this._comments.waveForm(this.waves, this.myCanvas)
    // Save Comment
    this.save.emit(this.comment)
    // Close Popover
    this.confirmClear = false
  }

  /**
   * Call for audio deletion or call for a fresh recording sesh
   */
  public record() {
    if (this.comment && this.comment.url && this.comment.url.length > 0) {
      // User should confirm clearing previous recording
      this.confirmClear = true
    } else {
      this.freshRecord()
    }
  }

  /**
   * Record Audio from the user's microphone
   */
  public freshRecord() {
    if (this.currentState == playState.recording) {
      this.recorder.stop()
    }
    // Clear existing recording
    this.chunks = []
    // Assign recorder to this component
    this.verifyAudio()
  }

  /**
   * Stop recording audio
   */
  public stopRecord() {
    this.currentState = playState.inactive
    // Clear time keeping interval and countdown
    clearInterval(this.rInterval)
    this.countdownI = -3
    // Clone playTime value
    this.rDuration = this.playTime + 0
    this.playTime = 0
    this.playheadPos = 0
    this.recorder.stop()
  }

  /**
   * Pause playback of the audio track
   */
  public pause() {
    this.currentState = playState.inactive
    clearInterval(this.pInterval)
    this.playTime = 0
    this.audio.pause()
  }

  /**
   * Start playback of the audio track
   */
  public play() {
    this._audio.signalAudioInitiated(this.comment._id)
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

  public setPlayhead() {
    if (this.currentState == playState.recording) {
      this.playheadPos = Math.round((this.playTime / this.MAX_SECONDS) * 100)
    } else {
      this.playheadPos = Math.round((this.audio.currentTime / this.MAX_SECONDS) * 100)
    }
  }

  /**
   * Set the playback back to the beginning #back2basics
   */
  public restartPlayback() {
    this.currentState = playState.playing
    // Reload
    this.audio.load()
    // Play!
    this.audio.play()
  }

  // public setPlaybackTime(event) {
  //   let percentLeftClicked = event.offsetX/this.playWidth
  //   if (this.audio) {
  //     this.audio.currentTime = this.MAX_SECONDS * percentLeftClicked
  //   }
  // }

  /**
   * Play state convenience functions
   */
  isPlayable(): boolean {
    return (
      this.audio &&
      this.audio.src &&
      (this.currentState == playState.playing || this.currentState == playState.inactive)
    )
  }
  isInactive(): boolean {
    return this.currentState == playState.inactive
  }
  isRecording(): boolean {
    return this.currentState == playState.recording
  }
  isPlaying(): boolean {
    return this.currentState == playState.playing
  }
  isLoading(): boolean {
    return this.currentState == playState.loading
  }

  shutPlayerDown(): void {
    if (this.audio && this.audio.pause) {
      // Stop stream if playing
      // - Also seems to resolve a bug that causes choppy audio while recording
      this.audio.pause()
      // Clear source
      this.audio.src = ''
      // Unload media
      this.audio.load()
      // Remove Audio element from DOM
      this.audio.remove()
    }
  }

  ngOnDestroy() {
    // Clear audio player
    this.shutPlayerDown()
    // Clear recorder
    this._audio.shutRecorderDown()
    // Clear Subscriptions
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }
}
