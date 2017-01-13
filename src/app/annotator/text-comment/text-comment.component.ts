import { document } from '@angular/platform-browser/src/facade/browser';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
    selector: 'text-comment',
    templateUrl: 'text-comment.component.html',
    styleUrls: ['./text-comment.component.scss']
})
export class TextCommentComponent implements OnInit {

    @Input() private comment: any;
    @Output() blur = new EventEmitter<string>(); 

    constructor() { 
        
    }

    ngOnInit() { 
        
    }

    updateComment(commentData: string) {
        this.blur.emit(commentData);
    }
}