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
  @Input() public visible: boolean
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
