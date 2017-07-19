import { Angulartics2 } from 'angulartics2/dist';
import { EdjiComment, Project, Reading } from '../../../shared/datatypes';
import { Subscription } from 'rxjs/Rx';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

// Project dependencies
import { ProjectService } from '../../../shared/project.service';
import { ReadingService } from '../../../shared/reading.service';
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

  private project: Project
  private currentReading: Reading
  private subscriptions: Subscription[] = []

  private replyComment: EdjiComment
  private createReply: boolean = false
  private user: any

  constructor(
    private _projects: ProjectService, 
    private _readings: ReadingService,
    private _auth: AuthService,
    private angulartics: Angulartics2
  ) { }

  ngOnInit() {
    // Subscribe to the reading
    this.subscriptions.push( this._readings.currentReading.subscribe(
      reading => {
        this.currentReading = reading;
        console.log(this.currentReading)
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
    console.log(this.comment)

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
    // Get original comment id
    

    // Tell the server we've got a comment!
    this.createReplyComment(type)
  }

  /**
   * Create a Comment of any Type
   * Requires three parameters, and finds the other information it needs
   * @param type What kind of reply comment: emoji, text...
   */
  createReplyComment(type: string): void {
    // We need to make sure they aren't already editing a comment
    // this.inactivateComment()

    let projectId = this.project._id
    let commentId = this.comment._id
    // let text: string = ''
    // for (var i = start; i <= end; i++) {
    //   text += this.reading.words[i].str
    // }

    this.angulartics.eventTrack.next({ action: type + 'ReplyCreate', properties: { category: 'heroFeature', label: 'attempt' }})
    
    var replyComment = <EdjiComment>{
      project_id: projectId,
      user_id: this.user._id,
      author: this.user.fullname,
      // reply_to: commentId,
      data: '',
      type: type
    }

    console.log('Add new ' + type + ' comment')
    console.log(commentId)

    console.log(replyComment)

    replyComment.new = true
    replyComment.active = true
    this.replyComment = replyComment
    this.createReply = true
    
  }
}