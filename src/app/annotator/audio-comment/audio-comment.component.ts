import { Component, Input } from '@angular/core'

import { EdjiComment } from '../../shared/datatypes'

@Component({
    selector: 'audio-comment',
    templateUrl: 'audio-comment.component.html',
    styleUrls: ['./audio-comment.component.scss']
})
export class AudioCommentComponent {

    // for some reason, if you add type Comment to comment, it crashes the whole site
    @Input() private comment: EdjiComment
    
    constructor() { 
        // console.log(emojiA)
    }
}