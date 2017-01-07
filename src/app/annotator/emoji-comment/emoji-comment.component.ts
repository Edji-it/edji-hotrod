import { document } from '@angular/platform-browser/src/facade/browser';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, ViewRef } from '@angular/core';

@Component({
    selector: 'emoji-comment',
    templateUrl: 'emoji-comment.component.html',
    styleUrls: ['./emoji-comment.component.scss']
})
export class EmojiCommentComponent implements OnInit {

    @Input() private comment: any;
    // @Input() private isActive: boolean;
    
    constructor() { 
        // console.log(emojiA);
    }

    ngOnInit() { 
        
    }
}