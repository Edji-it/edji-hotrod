import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core'

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
  }
  get comment(): EdjiComment {
    return this._comment
  }
  private _top: string
  @Input()
  set top(pos: string) {
    if (pos !== this._top) {
      // position changed
      this.visible = false
      this._top = pos
      setTimeout(() => {
        this.visible = true
      })
    }
  }
  get top(): string {
    return this._top
  }
  @Input() public visible: boolean
  @Output() closed = new EventEmitter()

  public fadeOut: boolean

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {}

  public close() {
    this.fadeOut = true
    // allow animation
    setTimeout(() => {
      this.closed.emit(true)
      this.fadeOut = false
    }, 1000)
  }
}
