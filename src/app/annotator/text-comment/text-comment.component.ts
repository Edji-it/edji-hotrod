import { document } from '@angular/platform-browser/src/facade/browser';
import { Component, EventEmitter, ElementRef, Input, Output, OnInit, AfterViewInit } from '@angular/core';

@Component({
    selector: 'text-comment',
    templateUrl: 'text-comment.component.html',
    styleUrls: ['./text-comment.component.scss']
})
export class TextCommentComponent implements OnInit, AfterViewInit {

    @Input() private comment: any;
    @Input() private readOnly: boolean;
    @Input() private preview: boolean;
    @Output() blur = new EventEmitter<string>(); 

    constructor(private element: ElementRef) { 
        
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        if (this.comment.active == true) {
            this.element.nativeElement.querySelector('textarea').focus();
        }
    }

    updateComment(commentData: string) {
        this.blur.emit(commentData);
    }

    blurField(event) {
        event.preventDefault();
        this.element.nativeElement.querySelector('textarea').blur();
    }

    focusField(event) {
        // setTimeout( function(event) {
            console.log('focus')
            // event.preventDefault();
            //this.textComment.nativeElement.value = 'hi'
            this.element.nativeElement.select();
            // this.element.nativeElement.querySelector('#textComment').value = 'hi'
        // }, 3000);
    }
}