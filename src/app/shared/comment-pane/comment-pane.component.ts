import {
    Component,
    ElementRef,
    OnInit
} from '@angular/core';

@Component({
  selector: 'comment-pane',
  templateUrl: './comment-pane.component.pug',
  styleUrls: ['./comment-pane.component.scss']
})
export class CommentPaneComponent implements OnInit {

  private commentPane: boolean

  constructor(
        public el: ElementRef
      ) { }

  ngOnInit() {
    
  }

  toggleCommentPane(comment?): void {
    if (!this.commentPane) {
      // this.lineNum = this._projects.lineNumberArray[comment.start]
      // this.commentCount = this._projects.commentPosArray[this.lineNum].length
    }
    console.log('show comment pane')
    this.commentPane = !this.commentPane
    setTimeout(() => {
      this.el.nativeElement.querySelector('.comment-container').scrollTop = this.el.nativeElement.querySelector('.comment-container').scrollHeight
    }, 1)
  }
}