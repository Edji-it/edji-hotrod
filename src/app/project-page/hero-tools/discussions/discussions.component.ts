import { Angulartics2 } from 'angulartics2/dist';
import { EdjiComment, Project, Reading } from '../../../shared/datatypes';
import { Subscription } from 'rxjs/Rx';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

// Project dependencies
import { ProjectService } from '../../../shared/project.service';
import { ReadingService } from '../../../shared/reading.service';

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

  constructor(
    private _projects: ProjectService, 
    private _readings: ReadingService,
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
    
    let replyComment = <EdjiComment>{
      project_id: projectId,
      // originalComment_id: commentId,
      data: '',
      type: type
    }

    console.log('Add new ' + type + ' comment')

    // Tell server we've added a comment
    this._projects.saveReply(replyComment)
      .then(replyComment => {
        // We add the comment from the service because it has an Id
        if (replyComment._id) {
          this.angulartics.eventTrack.next({ action: type + 'ReplyCreate', properties: { category: 'heroFeature', label: 'attempt' }})

          // Add setting to trigger focus on new comment
          replyComment.new = true // this is basically to tell our test cases which comment was just made
          console.log(replyComment)
          // this.inactivateComment()
          // this.commentsByIndexAdd(comment, start)
        } else {
          console.warn('Didn\'t get a reply comment back from server!')
        }
      })
      .catch(error => {
        // TRACK EXCEPTION
        this.angulartics.eventTrack.next({ action: type + 'ReplyCreate', properties: { category: 'heroFeature', label: 'failure' }})
        // We should figure out how to handle this properly!
        // Maybe show a warning icon?
        console.warn(error)
      })
  }
}