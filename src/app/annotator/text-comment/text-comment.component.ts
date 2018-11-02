import { Component, EventEmitter, ElementRef, Input, Output, OnInit, AfterViewInit, ViewChild } from '@angular/core'

// Project Dependencies
import { EdjiComment } from './../../shared/datatypes/comment'
import { CommentService } from '../../_services'

@Component({
    selector: 'text-comment',
    templateUrl: './text-comment.component.pug',
    styleUrls: ['./text-comment.component.scss']
})
export class TextCommentComponent implements OnInit, AfterViewInit {

    @ViewChild('textInput') public textInput: ElementRef

    @Input() public comment: EdjiComment
    @Input() public reply: boolean = false
    @Input() public readOnly: boolean
    // @Input() public editing: boolean

    @Output() activate: EventEmitter<any> = new EventEmitter<any>() 
    @Output() deactivate: EventEmitter<any> = new EventEmitter<any>() 

    public activated: boolean = false
    public editing: boolean = false

    // We need to know when changes to inactive to clear the editing variable
    @Input() set active(active){
        // this.editing = false
        // this.editing = false
        this.activated = active
    }
    get active() {
        return this.activated
    }

    @Input() set isEditing(isEditing: boolean) {
        this.editing = !!isEditing
        this.activated = !!isEditing
        // if (!this.active) {
        // this.activate()
        // }
        if (isEditing) {
            this.textInput && this.textInput.nativeElement.focus()
        }
    }
    get isEditing() { return this.editing }


    constructor(
        private element: ElementRef,
        private _comments: CommentService
    ) { 
        
    }

    ngOnInit() {
        setTimeout(() => {
            if (this.comment.active == true) {
                // this.editing = true
                this.editing = true
                setTimeout(() => {
                    // this.element.nativeElement.querySelector('textarea').focus()
                    this.textInput && this.textInput.nativeElement.focus()
                }, 100)
            }
        }, 100)
    }

    ngAfterViewInit() {
        
    }

    toggleActive(event) {
        if (this.activated) {
            if (event && ['a','i'].indexOf(event.target.tagName.toLowerCase()) < 0 && this.editing) {
                this.deactivate.emit(false)
            } else if (this.editing != true) {
                this.deactivate.emit(true)
            } else {
                // ignore event
            }
        } else {
            this.activate.emit()
        }
    }

    updateComment(commentData: any) {
        // this.editing = false
        this.editing = false
        // this.blur.emit(commentData)
        this.deactivate.emit()
    }

    blurField(event) {
        // this.editing = false
        this.editing = false
        event.preventDefault()
        this.element.nativeElement.querySelector('textarea').blur()
    }

    focusField(event) {
        this.element.nativeElement.select()
    }
}