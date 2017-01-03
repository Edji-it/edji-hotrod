import { CommentStmt } from '@angular/compiler/src/output/output_ast';
import { Comment } from '@angular/compiler/src/ml_parser/ast';
import { Component, Input, OnInit } from '@angular/core';

import { ProjectService } from '../../shared/project.service';

@Component({
  selector: 'edji-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input() private comment: any;
  @Input() private projectId: string;

  private justSaved: boolean = false;

  constructor(private _projects: ProjectService) { }

  ngOnInit() {

  }

  focusComment():void {

  }

  unfocusComment(): void {
    
  }

  /** 
   * To do
   */
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

}