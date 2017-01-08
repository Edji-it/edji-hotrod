import { CommentStmt } from '@angular/compiler/src/output/output_ast';
import { Comment } from '@angular/compiler/src/ml_parser/ast';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChange, ElementRef } from '@angular/core';

import { ProjectService } from '../../shared/project.service';

@Component({
  selector: 'edji-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input() public comment: any;
  public lineCount: number = 1;
  private yPos: number = 0;
  public expanded: boolean = false;
  
  private active = false;
  @Input()
  set isActive(isActive: boolean) {
    if (typeof(isActive) !== 'undefined' && this.active !== isActive) {
      this.toggleActive();
    }
  }
  get isActive(): boolean { return this.active; }

  @Output() commentDeleted = new EventEmitter<string>();
  @Output() commentActivation = new EventEmitter<boolean>();
  @Output() expandLine = new EventEmitter<number>();

  private justSaved: boolean = false;

  constructor(private _projects: ProjectService, public el: ElementRef) { }

  ngOnInit() {
    // If comment is newly added, focus on it when created!
  }

  focusComment():void {

  }

  unfocusComment(): void {
    
  }

  toggleActive( ): void {
      if (this.active === true) {
          this.active = false;
          this.commentActivation.emit(false);
          // Save when comment is toggled away from
          this.updateComment(this.comment.data);
      } else {
          this.active = true; 
          this.commentActivation.emit(true);
      }
  }

  // Updates comment in db
  public updateComment(commentData: string): void {
    this._projects.saveComment(this.comment.project_id, commentData, this.comment.start, this.comment.end, this.comment.type, this.comment.text, this.comment._id)
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

  public getVerticalPosition(): number {
    this.yPos = this.el.nativeElement.offsetTop;
    return this.el.nativeElement.offsetTop;
  }

  /**
   * Expand all stacked comments on the same line
   */
  toggleExpand(): void {
    this.expandLine.emit(this.yPos);
  }

}