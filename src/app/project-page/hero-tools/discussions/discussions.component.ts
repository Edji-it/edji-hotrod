import { Angulartics2 } from 'angulartics2/dist';
import { EdjiComment, Project, Reading } from '../../../shared/datatypes';
import { Subscription } from 'rxjs/Rx';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

// Project dependencies
import { ProjectService } from '../../../shared/project.service';
import { ReadingService } from '../../../shared/reading.service';
import { CommentService } from '../../../shared/comment.service';
import { AuthService } from '../../../shared/auth.service';

@Component({
  selector: 'hot-discussions',
  templateUrl: 'discussions.component.html',
  styleUrls: ['./discussions.component.scss']
})

export class DiscussionsComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = false
  @Input() comment: EdjiComment
  @Output() hide: EventEmitter<any> = new EventEmitter()
  @Output() activeReply: EventEmitter<any> = new EventEmitter()

  private project: Project
  private currentReading: Reading
  private subscriptions: Subscription[] = []
  private repliesById: any = {}

  private replyCommentNew: EdjiComment
  private createReply: boolean = false
  private user: any

  constructor(
    private _projects: ProjectService, 
    private _readings: ReadingService,
    private _auth: AuthService,
    private _comments: CommentService,
    private angulartics: Angulartics2,
    private el: ElementRef
  ) { }

  ngOnInit() {
    // Subscribe to the reading
    this.subscriptions.push( this._readings.currentReading.subscribe(
      reading => {
        this.currentReading = reading;
      },
      error => {
        console.error(error);
      }
    ) )

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
    ) )

    // Subscribe to updates to the reply reference object
    this.subscriptions.push( this._projects.repliesById.subscribe(
      (repliesById) => {
        this.repliesById = repliesById
      },
      (error) => {
        console.error(error)
      }
    ) )

    /** Set the current user every time it changes */
    this.subscriptions.push(
        this._auth.getCurrentUser().subscribe((user) => {
            this.user = user
        })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }

  /** 
   * Add Comment of type
   * - Fired from comment options tooltip
   */
  addReplyOfType(type: string): void {
    // Tell the server we've got a comment!
    this.createReplyComment(type)
  }

  /**
   * Create a Comment of any Type
   * Requires three parameters, and finds the other information it needs
   * @param type What kind of reply comment: emoji, text...
   */
  createReplyComment(type: string): void {
    let commentId = this.comment._id

    this.angulartics.eventTrack.next({ action: type + 'ReplyCreate', properties: { category: 'heroFeature', label: 'attempt' }})
    
    var replyCommentNew = <EdjiComment>{
      user_id: this.user._id,
      author: this.user.fullname,
      reply_to: commentId,
      data: '',
      type: type
    }

    replyCommentNew.new = true
    // replyCommentNew.active = true
    this.replyCommentNew = replyCommentNew

    if (type=='emoji') {
      this.activeEmojiKeyboardReply(this.replyCommentNew)
    }

    // Tell the server we've added a comment.
    this._projects.saveComment(this.replyCommentNew)
      .then(comment => {
        this.angulartics.eventTrack.next({ action: type + 'ReplyCreate', properties: { category: 'heroFeature', label: 'success' }})
        comment.active = true
        this._comments.activeComment = comment
        this._projects.addCommentToReplies(comment)
        setTimeout(() => {
          this.el.nativeElement.querySelector('.replyOverflow').scrollTop = this.el.nativeElement.querySelector('.replyOverflow').scrollHeight
        }, 100)
      })
      .catch(error => {
        // TRACK EXCEPTION
        this.angulartics.eventTrack.next({ action: type + 'ReplyCreate', properties: { category: 'heroFeature', label: 'failure' }})
        console.log(error)
      })
    
  }

  /** Used to determine which level of permission the user has for a specific comment
   * @param comment A comment object
   */
  private getCommentPermissions(comment: any): number {
      return this._comments.getCommentPermissions(comment, this.user, this.project)
  }

  private activeEmojiKeyboardReply(activeReply: any): void {
    this._comments.activeComment = activeReply
    this._comments.isEmojiKeyboardActive(this.user)
  }
}