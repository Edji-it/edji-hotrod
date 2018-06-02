import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { EdjiComment } from '../../shared/datatypes'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { ProjectService } from '../../_services'

enum playState {
  inactive,
  loading,
  playing,
  recording
}

@Component({
    selector: 'avatar-portal',
    templateUrl: './avatar-portal.component.pug',
    styleUrls: ['./avatar-portal.component.scss']
})
export class AvatarPortalComponent implements OnInit, OnDestroy {

  public subscriptions: Subscription[] = []
  public repliesById: any = {}
  public commentsByPos: any = []
  public currentState: playState = playState.inactive
  public audio

  @Input() public lineCount: Number = 1
  @Input() public active = false
  @Input() public lineY: Number = 0
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
    if (this.comment.type == 'audio' && this.comment.url && this.comment.url.length > 0) {
      this.loadAudioPlayer(this.comment.url)
    }
    // Subscribe to updates to the reply reference object
    this.subscriptions.push( this._projects.repliesById.subscribe(
      (repliesById) => {
        this.repliesById = repliesById
      },
      (error) => {
        console.error(error)
      }
    ))
  }

  public triggerCommentPane(selected?: boolean) {
    // If the avatar is the 8th where it shows '+' and number of comments
    if (this.indexOnLine == 8) {
      selected = false
    }
    // If selected is true then we will have the comment pane scroll to the comment the user clicked on
    if (selected) {
      this.comment.selected = true
    } else {
      this.comment.selected = false
    }
    this.toggleCommentPane.emit()
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
