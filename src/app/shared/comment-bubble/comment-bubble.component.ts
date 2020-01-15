import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'

// Internal
import { EdjiComment } from '../datatypes'

@Component({
  selector: 'comment-bubble',
  templateUrl: './comment-bubble.component.pug',
  styleUrls: ['./comment-bubble.component.scss'],
})
export class CommentBubbleComponent {
  @Input() public comment: EdjiComment
  @Input() public top: string
  private _visible: boolean
  @Input()
  set visible(visible: boolean) {
    if (!visible && this._visible) {
      // Fade out animation
      this.fadeOut = true
      setTimeout(() => {
        this.fadeOut = false
        this._visible = false
      }, 500)
    } else {
      this._visible = visible
    }
  }
  get visible(): boolean {
    return this._visible
  }

  @Output() closed = new EventEmitter()

  public fadeOut: boolean

  constructor(private router: Router, private route: ActivatedRoute) {}

  public close(clearParams?: boolean) {
    this.fadeOut = true
    if (clearParams) {
      // Clear URL params
      this.router.navigate(['./'], {
        relativeTo: this.route,
        queryParams: { comment: null, reply: null },
        queryParamsHandling: 'merge',
      })
    }
    // allow animation
    setTimeout(() => {
      this.closed.emit(true)
      this.fadeOut = false
    }, 1000)
  }
}
