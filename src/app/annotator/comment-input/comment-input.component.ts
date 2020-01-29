import {
  Component,
  EventEmitter,
  ElementRef,
  Input,
  Output,
  OnInit,
  AfterViewInit,
  ViewChild,
  OnDestroy,
} from '@angular/core'

// Project Dependencies
import { EdjiComment } from '../../shared/datatypes/comment'
import { CommentService } from '../../_services'
import { EmojiOnePipe, LinkifyPipe } from 'src/app/_pipes'
import * as emoji from 'emojione/lib/js/emojione'
import { Subscription } from 'rxjs'
import * as Rangy from 'rangy'
import { ActivatedRoute, Router } from '@angular/router'
import { SafeHtml } from '@angular/platform-browser'

@Component({
  selector: 'comment-input',
  templateUrl: './comment-input.component.pug',
  styleUrls: ['./comment-input.component.scss'],
})
export class CommentInputComponent implements OnInit, OnDestroy {
  @ViewChild('textInput', { static: false }) public textInput: ElementRef
  @ViewChild('textDisplay', { static: false }) public textDisplay: ElementRef

  @Input() public comment: EdjiComment
  @Input() public reply: boolean = false
  @Input() public readOnly: boolean
  // @Input() public editing: boolean

  @Output() activate: EventEmitter<any> = new EventEmitter<any>()
  @Output() deactivate: EventEmitter<any> = new EventEmitter<any>()
  @Output() toggleLabelDropdown: EventEmitter<boolean> = new EventEmitter<boolean>()

  public activated: boolean = false
  public textareaHeight: string = '32px'

  public htmlContents: SafeHtml

  private subscriptions: Subscription[] = []

  // We need to know when changes to inactive to clear the editing variable
  @Input() set active(active) {
    if (!this.readOnly) {
      if (active && !this.active) {
        this.activateField()
      } else if (!active && this.active) {
        this.blurField()
      }
    }
  }
  get active() {
    return this.activated
  }

  constructor(
    private element: ElementRef,
    private _comments: CommentService,
    private emojiPipe: EmojiOnePipe,
    private linkifyPipe: LinkifyPipe,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this._comments.activeInputAppend.subscribe(emoji => {
        if (this.comment._id === this._comments.activeComment._id) {
          // Insert at point of cursor
          let html = this.emojiPipe.transform(emoji)
          this.insertAtCaret(this.linkifyPipe.transformQuickLabels(html))
        }
      }),
    )
  }

  ngOnDestroy() {
    // When input is blurred by closing parent, make sure we save
    if (this.active) {
      this.updateComment()
    }
    // Handle subscriptions
    this.subscriptions.forEach(subscription => {
      subscription && subscription.unsubscribe()
    })
  }

  insertAtCaret(html) {
    var txtarea = this.textInput.nativeElement
    if (!txtarea) {
      return
    }
    // Construct node to insert
    let template = document.createElement('template')
    template.innerHTML = html
    let node = template.content.firstChild
    // Insert node at selection/focus
    let sel = Rangy.getSelection()
    let range = sel.getRangeAt(0)
    range.insertNode(node)
    // Restore focus at position
    range.collapseAfter(node)
    sel.setSingleRange(range)
  }

  /**
   * Determine if field should be activated or deactivated on Click
   * @param event Click event
   */
  activateCommentOrLink(event) {
    let checkForLink: boolean = event && ['a', 'i'].includes(event.target.tagName.toLowerCase())
    if (this.activated && checkForLink) {
      this.deactivate.emit(false)
    } else if (!this.activated && !this.readOnly) {
      if (checkForLink && event.target.classList.contains('comment-hashtag')) {
        // Handle hashtag links
        let tag = (event.target.innerText || '').trim()

        tag &&
          this.router.navigate(['./'], {
            relativeTo: this.route,
            queryParams: { pane: 'comments', search: `"${tag}"` },
          })
      } else if (checkForLink && event.target.classList.contains('quick-label')) {
        // Handle Quick Label links
        let label = (event.target.innerText || '').trim()
        label &&
          this.router.navigate(['./'], {
            relativeTo: this.route,
            queryParams: { pane: 'comments', label: `${label}` },
          })
      } else {
        this.activateField()
      }
    }
  }

  /**
   * If quick label clicked while editing, remove
   * @param e tap/click event
   */
  removeLabel(e) {
    if (e.target && e.target.classList.contains('quick-label')) {
      let el = e.target
      // We want to remove the wrapping span element, if possible
      if (el.parentNode.tagName === 'span') el = el.parentNode
      el.remove()
    }
  }

  activateField() {
    let contentsWithImages: string = this.emojiPipe.transform(this.comment.data)
    this.htmlContents = this.linkifyPipe.transformQuickLabels(contentsWithImages, true)
    // Set activated
    this.activated = true
    // Set textarea height
    this.textareaHeight = this.textDisplay ? this.textDisplay.nativeElement.scrollHeight + 'px' : '32px'
    this.focusField()
    // Notify output
    this.activate.emit()
  }

  /**
   * Focuses input field with caret/cursor at end
   */
  focusField() {
    // Focus field once present
    setTimeout(() => {
      let target = this.textInput.nativeElement
      let sel = Rangy.getSelection()
      let range = Rangy.createRange()
      range.selectNodeContents(target)
      range.collapse(false)
      sel.removeAllRanges()
      sel.addRange(range)
      target.focus({ preventScroll: true })
      range.detach()
    })
  }

  /**
   * Processes input as html to handle:
   * - Converting emojis in various forms (shortcode, image, unicode)
   * - Parsing/display hashtags and Quick Labels
   * - Removing other pasted html
   * @param html
   */
  cleanData(html: string): { data: string; type: string } {
    let type = 'text'
    let el = document.createElement('div')
    // We have to use the pipe to check for typed shortcodes
    el.innerHTML = this.emojiPipe.transform(html)
    let plainText = el.innerText || el.textContent
    let noText = !plainText.trim()
    // Process Quick Labels
    let labels = el.querySelectorAll('a.quick-label')
    labels.forEach((labelEl: any) => {
      let text = (labelEl.innerText || labelEl.textContent).trim()
      if (text) {
        let label = document.createTextNode(`#[${text}]`)
        labelEl.replaceWith(label)
      }
    })
    // Process emojis as images (default state in content editable)
    let imgs = el.querySelectorAll('img')
    imgs.forEach(imgEl => {
      let title = imgEl.getAttribute('title')
      if (title) {
        let code = document.createTextNode(':' + imgEl.getAttribute('title') + ':')
        imgEl.replaceWith(code)
      }
    })
    if (noText && imgs.length > 0 && imgs.length < 6) {
      // Large emoji only display
      type = 'emoji'
    }
    // Replace html breaks with new line chars
    let brs = el.querySelectorAll('br')
    brs.forEach(brEl => {
      let br = document.createTextNode('\n')
      brEl.replaceWith(br)
    })
    // Strip any other HTML by using innerText
    let text = el.innerText || el.textContent
    // Detect unicode emoji for conversion
    text = emoji.toShort(text)
    return { data: text, type: type }
  }

  updateComment() {
    let previousData = this.comment.data
    let clean: any = this.cleanData(this.textInput.nativeElement.innerHTML)
    this.comment.data = clean.data
    this.comment.type = this.comment.url ? 'audio' : clean.type
    this.activated = false
    this.htmlContents = ''
    // Prevent excess comment save calls
    let shouldNotSave = previousData === this.comment.data
    this.deactivate.emit(shouldNotSave)
  }

  blurField(event?: Event) {
    if (!this._comments.emojiActive) {
      this.activated = false
      event && event.preventDefault()
      this.updateComment()
      if (document.activeElement === this.textInput.nativeElement) {
        this.textInput.nativeElement.blur()
      }
    }
    // Make sure quick labels close
    this.toggleLabelDropdown.emit(false)
  }

  /**
   * Handle events while typing
   * @param e keyup Event
   */
  inputKeyupHandler(e): void {
    switch (e.keyCode) {
      case 27:
        // Escape
        this.blurField(e)
        break
      case 51:
      case 35:
        // Hashtag or 3
        this.toggleLabelDropdown.emit(true)
        break
      case 32:
        // Space
        this.toggleLabelDropdown.emit(false)
        break
    }
  }
}
