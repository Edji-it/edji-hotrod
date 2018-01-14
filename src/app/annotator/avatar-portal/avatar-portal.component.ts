import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core'
import { ProjectService } from 'app/shared'
import { Subscription } from 'rxjs'
import { EdjiComment } from 'app/shared/datatypes'
import { Angulartics2 } from 'angulartics2'

enum playState {
  inactive, 
  loading,
  playing,
  recording
}

@Component({
    selector: 'avatar-portal',
    templateUrl: 'avatar-portal.component.pug',
    styleUrls: ['./avatar-portal.component.scss']
})
export class AvatarPortalComponent implements OnInit, OnDestroy {
  
  private subscriptions: Subscription[] = []
  private commentsByPos: any = []
  private currentState: playState = playState.inactive
  private audio
    
  @Input() private lineCount: Number = 1
  @Input() private active: boolean = false
  @Input() private lineY: Number = 0
  @Input() public comment: EdjiComment
  @Input() public indexOnLine: Number = 1

  @Output() toggleCommentPane = new EventEmitter()

  constructor (
    private _projects: ProjectService,
    private angulartics: Angulartics2,
  ) { 
      
  }

  ngOnInit() {
    this.subscriptions.push(this._projects.commentByPos.subscribe(
      (commentsByPos) => {
        this.commentsByPos = commentsByPos
      }
    ))
    // If comment already has uploaded audio, load it
    if (this.comment.type=='audio' && this.comment.url && this.comment.url.length > 0) {
      this.loadAudioPlayer(this.comment.url)
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }  
  
  private loadAudioPlayer(url: string) {
    // Fresh audio object
    this.audio = new Audio()
    this.audio.preload = 'none'
    this.audio.src = url
    this.audio.load()

    this.audio.onplay = e => {
      this.currentState = playState.playing
    }

    this.audio.onended = e => {
      this.currentState = playState.inactive
    }
  }

  /** 
   * Pause playback of the audio track
   */
  private pause() {
    // Let analytics know user paused playback
    this.angulartics.eventTrack.next({ action: 'audioPause', properties: { category: 'heroFeature', label: 'success' }})
    this.currentState = playState.inactive
    this.audio.pause()
  }

  /** 
   * Start playback of the audio track
   */
  private play() {
    // Let analytics know user started playback
    this.angulartics.eventTrack.next({ action: 'audioPlay', properties: { category: 'heroFeature', label: 'success' }})
    this.currentState = playState.playing
    this.audio.play()
  }

  /**
   * Play state convenience functions
   */
  isInactive(): boolean {
    return this.currentState == playState.inactive
  }
  isPlaying(): boolean {
    return this.currentState == playState.playing
  }
}