import { SocketService } from '../../../../shared';
import { CommentService } from '../../../../shared/comment.service'
import { Subscription } from 'rxjs/Rx'
import { EdjiComment, Reading } from '../../../../shared/datatypes'
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, AfterViewInit } from '@angular/core'
import { ReadingService } from '../../../../shared/reading.service'


@Component({
  selector: 'hot-firecard',
  templateUrl: 'firecard.component.html',
  styleUrls: ['firecard.component.scss']
})

export class FirecardComponent implements OnInit, OnDestroy {

  @Input() fireComment: EdjiComment
  @Input() private commentMobile: boolean = false
  @Input() private commentMobileFirst: boolean = false
  // @Input() currentReading: Reading

  private yPos: number = 0
  private isImage: boolean = false
  private currentReading: Reading
  private subscriptions: Subscription[] = []
  private secondsAgo: number = 0
  private audio
  private myCanvas
  private playAble: boolean = false
  private isPlaying: boolean = false
  private viewInitRunOnce: boolean = false

  constructor(
    public el: ElementRef,
    private _readings: ReadingService,
    private _socket: SocketService,
    private _comments: CommentService
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this._readings.currentReading.subscribe(
        reading => {
          if (reading._id) {
             this.currentReading = reading
            if (this.currentReading.words[this.fireComment.start] && this.currentReading.words[this.fireComment.start].styles[0]==='img') {
              this.isImage = true
            }
          }
        },
        error => {
          console.error(error);
        }
      )
    )

    // Subscribe to comment comment updates
    this.subscriptions.push(
      this._socket.commentUpdates.subscribe((commentUpdate) => {
        let comment = commentUpdate.comment
        
        // Process different live comment updates
        if (commentUpdate.action === 'DELETE') {
          
        } else if (commentUpdate.action === 'UPDATE') {
          if (comment.type=='audio' && comment.url && comment.url.length > 0) {
            this.buildAudioView()
          }
        } else if (commentUpdate.action === 'CREATE') {
          
        }
      }, (error) => {
        console.warn(error)
      })
    )

    // Refresh time ago date every minute
    setInterval(()=> {
      this.secondsAgo++
    }, 60 * 1000)

    if (this.fireComment.type=='audio' && this.fireComment.url && this.fireComment.url.length > 0) {
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
        this.audio.load()
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
    el = el.getBoundingClientRect();
    return {
      left: el.left + window.scrollX,
      top: el.top + window.scrollY
    }
  }

  public getImagePos(imageIndex) {
    let yOffset = 100
    let imageElement = document.getElementById("readingImage" + imageIndex)
    this.yPos = this.getOffset(imageElement).top
    window.scrollTo(0, this.yPos - yOffset)
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
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


  private getPlayhead() : number {
    if (this.audio) {
      return Math.round(this.audio.currentTime / 30 * 100)
    } else {
      return 0
    }
  }

  private setPlaybackTime(event) {
    let percentLeftClicked = event.offsetX/event.target.clientWidth
    this.audio.currentTime = 30 * percentLeftClicked
  }
}