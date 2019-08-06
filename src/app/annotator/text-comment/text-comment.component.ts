import { Component, EventEmitter, ElementRef, Input, Output, OnInit, AfterViewInit, ViewChild } from '@angular/core'

// Project Dependencies
import { EdjiComment } from './../../shared/datatypes/comment'
import { CommentService } from '../../_services'

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

  // We need to know when changes to inactive to clear the editing variable
  @Input() set active(active) {
    setTimeout(() => {
      if (!this.readOnly) {
        this.activated = active

        if (active) {
          this.activateField()
        }
      }
    }, 1)
  }
  get active() {
    return this.activated
  }

  constructor(private element: ElementRef, private _comments: CommentService) {}

  ngOnInit() {
    setTimeout(() => {
      if (this.comment.active == true) {
        this.textInput && this.textInput.nativeElement.focus({ preventScroll: true })
      }
    }, 200)
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
    // Set activated
    this.activated = true
    // Set textarea height
    this.textareaHeight = this.textDisplay ? this.textDisplay.nativeElement.scrollHeight + 'px' : '60px'
    // Focus text field
    this.textInput && this.textInput.nativeElement.focus({ preventScroll: true })
    // Notify output
    this.activate.emit()
  }

  updateComment(commentData: any) {
    this.activated = false
    this.deactivate.emit()
  }

  blurField(event) {
    this.activated = false
    event.preventDefault()
    this.textInput.nativeElement.blur()
  }

  focusField(event) {
    this.element.nativeElement.select()
  }
}
