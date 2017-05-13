import { Comment } from '../../shared/datatypes';
import { Component, Input } from '@angular/core'

// import { Comment } from './../../shared/datatypes';

@Component({
    selector: 'emoji-comment',
    templateUrl: 'emoji-comment.component.html',
    styleUrls: ['./emoji-comment.component.scss']
})
export class EmojiCommentComponent {

    // for some reason, if you add type Comment to comment, it crashes the whole site
    @Input() private comment: any
    
    constructor() { 
        // console.log(emojiA)
    }
}