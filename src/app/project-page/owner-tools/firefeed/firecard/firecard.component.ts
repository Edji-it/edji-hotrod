import { Subscription } from 'rxjs'
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, AfterViewInit } from '@angular/core'

// Internal
import { EdjiComment, Reading } from '../../../../shared/datatypes'
import { CommentService, ReadingService, SocketService } from '../../../../_services'
import { ProjectStore } from 'src/app/_store';

@Component({
  selector: 'hot-firecard',
  templateUrl: './firecard.component.pug',
  styleUrls: ['firecard.component.scss'],
})
export class FirecardComponent implements OnInit, OnDestroy {
  private currentReading: Reading
  private subscriptions: Subscription[] = []
  private yPos: number = 0
  public isImageSpot: boolean = false
  public secondsAgo: number = 0
  public audio
  public myCanvas
  public playAble: boolean = false
  public isPlaying: boolean = false
  public viewInitRunOnce: boolean = false
  public lastWord: number = 0

  @Input() fireComment: EdjiComment

  constructor(
    public el: ElementRef,
    private _readings: ReadingService,
    private _socket: SocketService,
    private _comments: CommentService,
    private projectStore: ProjectStore,
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this._readings.currentReading.subscribe(
        reading => {
          if (reading._id) {
            this.currentReading = reading
            if (
              this.fireComment.loc &&
              typeof this.fireComment.loc.x == 'number' &&
              !this.fireComment.text &&
              !this.fireComment.box
            ) {
              this.isImageSpot = true
            }
          }
        },
        error => {
          console.error(error)
        },
      ),
    )

    this.subscriptions.push(
      this.projectStore.lastWordUpdateState.subscribe(lastWord => {
        this.lastWord = lastWord
      }),
    )

    // Refresh time ago date every minute
    setInterval(() => {
      this.secondsAgo++
    }, 60 * 1000)

    if (this.fireComment.type == 'audio' && this.fireComment.url && this.fireComment.url.length > 0) {
      this.buildAudioView()
    }
  }

  // ngAfterViewInit(): void {
  //   // If comment already has uploaded audio, load it
  //   if (!this.viewInitRunOnce && this.fireComment.type=='audio' && this.fireComment.url && this.fireComment.url.length > 0) {
  //     this.buildAudioView()
  //   }
  //   // throw new Error('Not implemented yet.')
  // }

  public buildAudioView() {
    this.myCanvas = this.el.nativeElement.querySelector('.wave-form')
    if (this.myCanvas) {
      this.audio = new Audio()
      this.audio.src = this.fireComment.url
      // Do not load audio until played
      // this.audio.load()
      this.playAble = true
      // Build the waveform
      this._comments.waveForm(this.fireComment.dataArray, this.myCanvas)
    } else {
      setTimeout(() => {
        this.buildAudioView()
      }, 250)
    }
  }

  public getOffset(el) {
    el = el.getBoundingClientRect()
    return {
      left: el.left + window.scrollX,
      top: el.top + window.scrollY,
    }
  }

  public getImagePos(imageIndex) {
    // If the image index is further down than the last word rendered, send out a request to update the lastWord
    if (imageIndex > this.lastWord) {
      this.projectStore.lastWordUpdateSubj.next(imageIndex)
      setTimeout(() => {
        this.scrollToImage(imageIndex)
      }, 1)
    } else {
      this.scrollToImage(imageIndex)
    }
  }

  public scrollToImage(imageIndex) {
    let yOffset = 100
    let imageElement = document.getElementById('readingImage' + imageIndex)
    this.yPos = this.getOffset(imageElement).top
    window.scrollTo(0, this.yPos - yOffset)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  /**
   * Pause playback of the audio track
   */
  private pause() {
    this.isPlaying = false
    // clearInterval(this.pInterval)
    // this.playTime = '0px'
    this.audio.pause()
    // Clear the playing element and allow recording once audio clip has finished playing
    this.audio.onended = e => {
      this.isPlaying = false
    }
  }

  /**
   * Start playback of the audio track
   */
  private play() {
    // Load player
    this.audio.load()
    this.isPlaying = true
    // this.pStartAt = new Date()
    this.audio.play()
  }

  /**
   * Set the playback back to the beginning #back2basics
   */
  private restartPlayback() {
    this.audio.load()
  }

  private getPlayhead(): number {
    if (this.audio) {
      return Math.round((this.audio.currentTime / 30) * 100)
    } else {
      return 0
    }
  }

  private setPlaybackTime(event) {
    let percentLeftClicked = event.offsetX / event.target.clientWidth
    this.audio.currentTime = 30 * percentLeftClicked
  }
}
