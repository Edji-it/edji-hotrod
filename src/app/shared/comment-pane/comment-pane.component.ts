import { Subscription } from 'rxjs/Rx'
import { ProjectService } from '../index'
import { EdjiComment } from '../datatypes/index'
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'comment-pane',
  templateUrl: './comment-pane.component.pug',
  styleUrls: ['./comment-pane.component.scss']
})
export class CommentPaneComponent implements OnInit, OnDestroy {

  // General variables for the comment pane component
  private commentPane: boolean
  private lineNum: number = 0
  private commentCount: number = 0
  private rowComments: EdjiComment[][] = []
  // Is fully visible, focused, and editable
  private active = false

  // Subscriptions and related
  private subscriptions: Subscription[] = []
  private commentByPos: any[] = []
  private lineNumArray: any[] = []

  // Comment Pane Component Inputs
  @Input() visible: boolean = false
  @Input() comment: EdjiComment
  @Input()
  set isActive(isActive: boolean) {
    if (typeof(isActive) !== 'undefined' && this.active !== isActive) {
      this.active = isActive
      
      // if the comment is new, let's adjust the scroll position if there are a ton of comments
      if (this.comment.new) {
        setTimeout(() => {
          this.el.nativeElement.querySelector('.comment-container').scrollTop = this.el.nativeElement.querySelector('.comment-container').scrollHeight
        }, 1)
      }

      if (!isActive) {
        // Trigger save when deactivated externally i.e. emoji keyboard
        
      }
    } 
  }

  // Comment Pane Component Outputs
  @Output() hideComment = new EventEmitter()

  constructor(
      private _projects: ProjectService,
      public el: ElementRef
    ) { }

  ngOnInit() {
    // Subscribe to updates to the comment by line number position array
    this.subscriptions.push( this._projects.commentByPos.subscribe(
      (commentByPos) => {
        this.commentByPos = commentByPos
        this.lineNumArray = this._projects.lineNumberArray
      },
      (error) => {
        console.error(error)
      }
    ))
  }

  dismissCommentPane() {
    this.visible = false
    this.hideComment.emit()
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }
}