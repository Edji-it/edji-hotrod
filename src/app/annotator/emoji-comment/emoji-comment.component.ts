import { Component, EventEmitter, Input, Output } from '@angular/core';

import { EdjiComment } from '../../shared/datatypes'

@Component({
    selector: 'emoji-comment',
    template: require('pug-loader!./emoji-comment.component.pug')(),
    styleUrls: ['./emoji-comment.component.scss']
})
export class EmojiCommentComponent {

    // for some reason, if you add type Comment to comment, it crashes the whole site
    @Input() private comment: EdjiComment
    @Input() private reply: boolean = false
    @Input() private readOnly: boolean = false

    @Output() activate: EventEmitter<any> = new EventEmitter<any>() 
    @Output() deactivate: EventEmitter<any> = new EventEmitter<any>() 
    
    constructor() { 
        // console.log(emojiA)
    }
}