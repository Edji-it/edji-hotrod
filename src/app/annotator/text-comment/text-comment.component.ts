import { Component, EventEmitter, ElementRef, Input, Output, OnInit, AfterViewInit, ViewChild } from '@angular/core'

// Project Dependencies
import { EdjiComment } from './../../shared/datatypes/comment'
import { CommentService } from '../../_services'
import { EmojiOnePipe } from 'src/app/_pipes'
import * as emoji from 'emojione/lib/js/emojione'
import { Subscription } from 'rxjs'
import * as Rangy from 'rangy'

@Component({
  selector: 'text-comment',
  templateUrl: './text-comment.component.pug',
  styleUrls: ['./text-comment.component.scss'],
})
export class TextCommentComponent implements OnInit, AfterViewInit {
  @ViewChild('textInput', { static: false }) public textInput: ElementRef
  @ViewChild('textDisplay', { static: false }) public textDisplay: ElementRef

  @Input() public comment: EdjiComment
  @Input() public reply: boolean = false
  @Input() public readOnly: boolean
  // @Input() public editing: boolean

  @Output() activate: EventEmitter<any> = new EventEmitter<any>()
  @Output() deactivate: EventEmitter<any> = new EventEmitter<any>()

  public activated: boolean = false
  public textareaHeight: string = '60px'

  public htmlContents: string

  private subscriptions: Subscription[] = []

  // We need to know when changes to inactive to clear the editing variable
  @Input() set active(active) {
    setTimeout(() => {
      if (!this.readOnly) {
        if (active) {
          this.activateField()
        } else {
          this.blurField()
        }
      }
    }, 1)
  }
  get active() {
    return this.activated
  }

  constructor(private element: ElementRef, private _comments: CommentService, private emojiPipe: EmojiOnePipe) {}

  ngOnInit() {
    setTimeout(() => {
      if (this.comment.active == true) {
        this.textInput && this.textInput.nativeElement.focus({ preventScroll: true })
      }
    }, 200)

    this.subscriptions.push(
      this._comments.emojiEdit.subscribe(emoji => {
        if (this.comment._id === this._comments.activeComment._id) {
          // Insert at point of cursor
          this.insertAtCaret(this.emojiPipe.transform(emoji))
        }
      }),
    )
  }

  insertAtCaret(html) {
    var txtarea = this.textInput.nativeElement
    if (!txtarea) {
      return
    }
    let template = document.createElement('template')
    template.innerHTML = html
    let node = template.content.firstChild
    let sel = Rangy.getSelection()
    let range = sel.getRangeAt(0)
    range.insertNode(node)
    // Restore focus at position
    range.collapseAfter(node)
    sel.setSingleRange(range)
  }

  ngAfterViewInit() {}

  /**
   * Determine if field should be activated or deactivated on Click
   * @param event Click event
   */
  clickToggleActive(event) {
    if (this.activated) {
      if (event && ['a', 'i'].indexOf(event.target.tagName.toLowerCase()) < 0) {
        this.deactivate.emit(false)
      } else {
        // ignore event
      }
    } else if (!this.readOnly) {
      this.activateField()
    }
  }

  activateField() {
    this.htmlContents = this.emojiPipe.transform(this.comment.data)
    // Set activated
    this.activated = true
    // Set textarea height
    this.textareaHeight = this.textDisplay ? this.textDisplay.nativeElement.scrollHeight + 'px' : '60px'
    // Focus text field
    var sel = Rangy.getSelection()
    sel.selectAllChildren(this.textInput.nativeElement)
    sel.collapseToEnd()
    // Notify output
    this.activate.emit()
  }

  cleanData(html: string): any {
    /**
     * To do: DOM manipulation in separate field/element
     */
    let plainText = this.textInput.nativeElement.innerText
    let noText = !plainText.trim()
    let type = 'text'
    let el = this.textInput.nativeElement.cloneNode(true)

    let imgs = el.querySelectorAll('img')
    imgs.forEach(imgEl => {
      let title = imgEl.getAttribute('title')
      if (title) {
        let code = document.createTextNode(':' + imgEl.getAttribute('title') + ':')
        imgEl.replaceWith(code)
      }
    })
    console.log(plainText, 'has text', !noText, ' imgs', imgs.length)
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
    let text = el.innerText
    // Detect unicode emoji for conversion
    text = emoji.toShort(text)
    return { data: text, type: type }
  }

  updateComment() {
    let clean: any = this.cleanData(this.textInput.nativeElement.innerHTML)
    console.log(clean)
    this.comment.data = clean.data
    this.comment.type = this.comment.url ? 'audio' : clean.type
    this.activated = false
    this.htmlContents = ''
    this.deactivate.emit()
  }

  blurField(event?: Event) {
    if (!this._comments.emojiActive) {
      this.activated = false
      event.preventDefault()
      this.updateComment()
      console.log("type ", event.type)
      if (event && event.type !== 'blur') {
        this.textInput.nativeElement.blur()
      }
    }
  }

  focusField(event) {
    this.element.nativeElement.select()
  }
}
