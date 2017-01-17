import { document } from '@angular/platform-browser/src/facade/browser';
import { Component, EventEmitter, ElementRef, Input, Output, OnInit, AfterViewInit } from '@angular/core';

@Component({
    selector: 'text-comment',
    templateUrl: 'text-comment.component.html',
    styleUrls: ['./text-comment.component.scss']
})
export class TextCommentComponent implements OnInit, AfterViewInit {

    @Input() private comment: any;
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
}