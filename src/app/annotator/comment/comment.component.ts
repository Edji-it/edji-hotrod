import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'edji-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input()
  private comment: any;

  constructor() { }

  ngOnInit() {

  }

  focusComment():void {

  }

  unfocusComment(): void {
    
  }

  /** 
   * To do
   */
  updateComment(commentId, commentText): void {

  }

}