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

  @Input() visible: boolean = false
  @Input() comment: EdjiComment
  @Output() hideComment = new EventEmitter()

  private commentPane: boolean
  private lineNum: number = 0
  private commentCount: number = 0
  private rowComments: EdjiComment[][] = []

  // Subscriptions and related
  private subscriptions: Subscription[] = []
  private commentByPos: any[] = []
  private lineNumArray: any[] = []

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

  toggleCommentPane(comment?): void {
    this.commentPane = !this.commentPane
    setTimeout(() => {
      this.el.nativeElement.querySelector('.comment-container').scrollTop = this.el.nativeElement.querySelector('.comment-container').scrollHeight
    }, 1)
  }

  dismissCommentPane() {
    this.visible = false
    this.hideComment.emit()
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }
}