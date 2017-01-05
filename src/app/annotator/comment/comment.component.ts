import { CommentStmt } from '@angular/compiler/src/output/output_ast';
import { Comment } from '@angular/compiler/src/ml_parser/ast';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ProjectService } from '../../shared/project.service';

@Component({
  selector: 'edji-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input() private comment: any;
  @Input() private projectId: string;
  @Output() commentDeleted = new EventEmitter<string>();
  @Output() commentActivation = new EventEmitter<boolean>();

  private justSaved: boolean = false;

  constructor(private _projects: ProjectService) { }

  ngOnInit() {
    // If comment is newly added, focus on it when created!
  }

  focusComment():void {

  }

  unfocusComment(): void {
    
  }


  toggleActive(): void {
      if (this.comment.active === true) {
          this.comment.active = false;
          this.commentActivation.emit(false);
      } else {
          this.comment.active = true; 
          this.commentActivation.emit(true);
      }
  }

  // Updates comment when child comment-type tells it to via Output
  updateComment(commentData: string): void {
    this._projects.saveComment(this.projectId, commentData, this.comment.start, this.comment.end, this.comment.text, this.comment._id)
      .then(data => {
        this.justSaved = true;
        setTimeout(() => {
          this.justSaved = false;
        }, 1000);
      })
      .catch(error => {
        console.log(error);
      });
  }

  // Deletes comment via Project service, which updates the local Project object
  deleteComment(commentId: string):void {
    this._projects.deleteComment(commentId)
      .then(data => {
        // Tell Annotator to destroy this comment element!
        this.commentDeleted.emit(commentId);
      })
      .catch(error => {
        console.log(error);
      });
  }

}