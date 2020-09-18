import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { AuthService } from 'src/app/_services'

// Internal
import { EdjiComment } from '../datatypes'

declare const ImmersiveReader: any

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
    if (!visible && this._visible && !this.fadeOut) {
      // Fade out animation
      this.fadeOut = true
      setTimeout(() => {
        this.fadeOut = false
        this.closed.emit(true)
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

  constructor(private router: Router, private route: ActivatedRoute, private _auth: AuthService) {}

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

  exitImmersiveReader() {
    console.log('exited!')
  }

  async openImmersiveReader() {
    console.log(this.comment)
    const { access_token, subdomain } = await this._auth.getImmersiveReaderCredentials()
    const content = `Comment on: ${this.comment.text}\n\nComment: ${this.comment.data}`
    const data = {
      title: `Comment by ${this.comment.author}`,
      chunks: [
        {
          content,
          mimeType: 'text/plain',
        },
      ],
    }
    const options = {
      onExit: this.exitImmersiveReader,
      uiZIndex: 8000,
    }
    try {
      ImmersiveReader.launchAsync(access_token, subdomain, data, options)
    } catch (err) {
      console.error('error loading immersive reader', err)
    }
  }
}
