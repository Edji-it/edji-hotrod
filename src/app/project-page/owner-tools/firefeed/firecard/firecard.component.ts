import { CommentPermissions } from '../../../../shared/datatypes/index';
import { Angulartics2 } from 'angulartics2/dist'
import { AuthService, ProjectService } from '../../../../shared/index';
import { SocketService } from '../../../../shared';
import { CommentService } from '../../../../shared/comment.service'
import { Subscription } from 'rxjs/Rx'
import { EdjiComment, Reading } from '../../../../shared/datatypes'
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, AfterViewInit } from '@angular/core'
import { ReadingService } from '../../../../shared/reading.service'


@Component({
  selector: 'hot-firecard',
  templateUrl: 'firecard.component.pug',
  styleUrls: ['firecard.component.scss']
})

export class FirecardComponent implements OnInit, OnDestroy {
  
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

  private reRecordAudio: boolean
  private isLoading: boolean
  private justSaved: boolean
  // Is fully visible, focused, and editable
  private active = false
  private showDeleteModal: boolean
  private user: any
  private project: any

  @Input() fireComment: EdjiComment
  @Input() private commentMobile: boolean = false
  @Input() private commentMobileFirst: boolean = false
  @Input()
  set isActive(isActive: boolean) {
    if (typeof(isActive) !== 'undefined' && this.active !== isActive) {
      this.active = isActive
      if (!isActive) {
        // Trigger save when deactivated externally i.e. emoji keyboard
        this.deactivate(this.fireComment)
      }
    } 
  }
  get isActive(): boolean { return this.active }

  @Output() commentActivation = new EventEmitter<boolean>()
  @Output() commentUpdated: EventEmitter<any> = new EventEmitter()
  @Output() commentReply = new EventEmitter()

  constructor(
    private _projects: ProjectService,
    private angulartics: Angulartics2,
    public el: ElementRef,
    private _readings: ReadingService,
    private _socket: SocketService,
    private _comments: CommentService,
    private _auth: AuthService
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
    
    // Subscribe to updates from that project once we're subscribed to the reading
    this.subscriptions.push( this._projects.currentProject.subscribe(
      (project) => {
        if (project) {
          this.project = project
        }
      },
      (error) => {
        console.error(error)
      }
    ))
    
    /** Set the current user every time it changes */
    this.subscriptions.push(
        this._auth.getCurrentUser().subscribe((user) => {
            this.user = user
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

  /** Used to determine which level of permission the user has for a specific comment
   * @param comment A comment object
   */
  private getCommentPermissions(comment: any): number {
    return this._comments.getCommentPermissions(comment, this.user, this.project)
  }

  /**
   * Deactivates/unfocuses comment, and optionally triggers save
   * @param comment (optional) Full EdjiComment object
   * TO-DO: Clean out code for optionally passing JUST comment.data as comment parameter
   */
  deactivate(comment ?: any, noUpdate ?: boolean): void {
    this.fireComment.active = this.active = false
    this.commentActivation.emit(false)
    this._comments.activeComment.active = false
    // Save when comment is toggled away from
    if (comment && !noUpdate) {
      this.updateComment(comment)
    }
  } // deactivate(commentData ?: any): void

    /**
   * Saves updates to comments
   * @param comment Full EdjiComment object
   */
  public updateComment(comment: EdjiComment): void {
    this.reRecordAudio = false
    if (comment._id) {
      this.fireComment.data = comment.data
      this.fireComment.url = comment.url
    } else {
      this.fireComment.data = comment
    } 

    this.angulartics.eventTrack.next({ action: comment.type + 'updateComment', properties: { category: 'projectAction', label: 'attempt' }})
    this.isLoading = true

    this._projects.saveComment(this.fireComment)
    .then(comment => {
      // Appropriate post-delete action, sorted by comment type.
      this.angulartics.eventTrack.next({ action: comment.type + 'updateComment', properties: { category: 'projectAction', label: 'success' }})
      this.isLoading = false
      
      this.justSaved = true
      this.commentUpdated.emit()
      setTimeout(() => {
        this.justSaved = false
        this.fireComment.active = false
      }, 1000)
    })
    .catch(error => { 
      // Appropriate post-delete failure action, sorted by comment type.
      this.angulartics.eventTrack.next({ action: comment.type + 'updateComment', properties: { category: 'projectAction', label: 'failure' }})
      console.error(error)
    })
  }

  // Deletes comment via Project service, which updates the local Project object
  public deleteComment(comment: any) : void {
    // Stop the user from continuing to edit, and close emoji keyboard
    this.deactivate(this.fireComment)
    this.angulartics.eventTrack.next({ action: comment.type + 'deleteComment', properties: { category: 'projectAction', label: 'attempt' }})
    
    this._projects.deleteComment(comment)
    .then(data => {
      this.angulartics.eventTrack.next({ action: comment.type + 'deleteComment', properties: { category: 'projectAction', label: 'success' }})
      // Tell Annotator to destroy this comment element!
      this.showDeleteModal = false
    })
    .catch(error => {
      // TRACK EXCEPTION
      this.angulartics.eventTrack.next({ action: comment.type + 'deleteComment', properties: { category: 'projectAction', label: 'failure' }})
      console.error(error)
    })
  }
}