import { CommentStmt } from '@angular/compiler/src/output/output_ast';
import { Comment } from '@angular/compiler/src/ml_parser/ast';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChange, ElementRef } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

import { ProjectService } from '../../shared/project.service';

@Component({
  selector: 'edji-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  public lineCount: number = 1;
  public expanded: boolean = false;

  private yPos: number = 0;
  private justSaved: boolean = false;
  private active = false;

  @Input() public comment: any;
  @Input() private readOnly: false; 
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

  constructor(
        private _projects: ProjectService,
        private angulartics: Angulartics2,
        public el: ElementRef
      ) { }

  ngOnInit() {
    // If comment is newly added, focus on it when created!
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

  activate(): void {
    this.active = true;
    this.commentActivation.emit(true);
  }

  deactivate(): void {
    this.active = false;
    this.commentActivation.emit(false);
    // Save when comment is toggled away from
    this.updateComment(this.comment.data);
  }

  // Updates comment in db
  public updateComment(commentData: string): void {
    this.angulartics.eventTrack.next({ action: 'updateComment', properties: { category: 'projectAction', label: 'attempt' }});

    this._projects.saveComment(this.comment.project_id, commentData, this.comment.start, this.comment.end, this.comment.type, this.comment.text, this.comment._id)
      .then(comment => {
        this.angulartics.eventTrack.next({ action: 'updateComment', properties: { category: 'projectAction', label: 'success' }});
        this.justSaved = true;
        setTimeout(() => {
          this.justSaved = false;
        }, 1000);
      })
      .catch(error => {
        // TRACK EXCEPTION
        console.log(error);
      });
  }

  // Deletes comment via Project service, which updates the local Project object
  deleteComment(comment: any):void {
    this.angulartics.eventTrack.next({ action: 'deleteComment', properties: { category: 'projectAction', label: 'attempt' }});

    this._projects.deleteComment(comment)
      .then(data => {
        this.angulartics.eventTrack.next({ action: 'deleteComment', properties: { category: 'projectAction', label: 'success' }});
        // Tell Annotator to destroy this comment element!
        this.commentDeleted.emit(comment._id);
      })
      .catch(error => {
        // TRACK EXCEPTION
        console.log(error);
      });
  }

  /**
   * Returns comment block's y position
   * - Used for collapse/expand multiple comments
   */
  public getVerticalPosition(): number {
    this.yPos = Math.round(this.el.nativeElement.offsetTop);
    return this.yPos;
  }

  /**
   * Expand all stacked comments on the same line
   */
  toggleExpand(): void {
    this.expandLine.emit(this.yPos);
  }

}