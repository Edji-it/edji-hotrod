import { Component, OnInit, OnDestroy, Input } from '@angular/core'

// Internal
import { EdjiComment } from '../datatypes'

@Component({
  selector: 'comment-bubble',
  templateUrl: './comment-bubble.component.pug',
  styleUrls: ['./comment-bubble.component.scss'],
})
export class CommentBubbleComponent implements OnInit, OnDestroy {
  // Comment Pane Component Inputs
  private _comment: EdjiComment
  @Input()
  set comment(comment: EdjiComment) {
    this._comment = comment
    // let commentApplied: boolean
    // if (!this._comment || (comment && comment._id !== this._comment._id)) {
    //   commentApplied = true
    // }
    // this._comment = comment
    // if (commentApplied) {
    //   this.filterComments()
    //   this.evaluateShouldScroll()
    // }
  }
  get comment(): EdjiComment {
    return this._comment
  }

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {}
}
