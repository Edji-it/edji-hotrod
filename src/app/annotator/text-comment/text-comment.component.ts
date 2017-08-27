import { document } from '@angular/platform-browser/src/facade/browser'
import { Component, EventEmitter, ElementRef, Input, Output, OnInit, AfterViewInit } from '@angular/core'

import { EdjiComment } from './../../shared/datatypes/comment'
import { CommentService } from '../../shared/comment.service'

@Component({
    selector: 'text-comment',
    templateUrl: 'text-comment.component.html',
    styleUrls: ['./text-comment.component.scss']
})
export class TextCommentComponent implements OnInit, AfterViewInit {

    @Input() private comment: EdjiComment
    @Input() private reply: boolean = false
    @Input() private readOnly: boolean
    @Input() private preview: boolean
    @Output() blur: EventEmitter<any> = new EventEmitter<any>() 

    private editing: boolean
    private activated: boolean = false

    // We need to know when changes to inactive to clear the editing variable
    @Input() set active(active){
        // this.editing = false
        this._comments.editing = false
        this.activated = active
    }
    get active() {
        return this.activated
    }

    constructor(
        private element: ElementRef,
        private _comments: CommentService
    ) { 
        
    }

    ngOnInit() {
        setTimeout(() => {
            if (this.comment.active == true) {
                // this.editing = true
                this._comments.editing = true
                setTimeout(() => {
                    this.element.nativeElement.querySelector('textarea').focus()
                }, 100)
            }
        }, 1)
    }

    ngAfterViewInit() {
        
    }

    updateComment(commentData: any) {
        // this.editing = false
        this._comments.editing = false
        this.blur.emit(commentData)
    }

    blurField(event) {
        // this.editing = false
        this._comments.editing = false
        event.preventDefault()
        this.element.nativeElement.querySelector('textarea').blur()
    }

    focusField(event) {
        // setTimeout( function(event) {
            console.log('focus')
            // event.preventDefault()
            //this.textComment.nativeElement.value = 'hi'
            this.element.nativeElement.select()
            // this.element.nativeElement.querySelector('#textComment').value = 'hi'
        // }, 3000)
    }
}