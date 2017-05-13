import { CommentStmt } from '@angular/compiler/src/output/output_ast'
import { Component, EventEmitter, Input, OnInit, Output, SimpleChange, ElementRef } from '@angular/core'
import { Angulartics2 } from 'angulartics2'

import { ProjectService } from '../../shared/project.service'
import { Comment, CommentPermissions } from './../../shared/datatypes'

@Component({
  selector: 'edji-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  public lineCount: number = 1
  public expanded: boolean = false

  private yPos: number = 0
  private justSaved: boolean = false
  private isLoading: boolean = false
  // Hold the current scroll position for the iOS fix
  private currentScroll: number
  // Is fully visible, focused, and editable
  private active = false
  // Is fully visible, focused, but not editable
  private preview = false

  @Input() public comment: Comment
  @Input() private readOnly: boolean = false
  @Input() private userPermission: number = CommentPermissions.READ
  @Input()
  set isActive(isActive: boolean) {
    if (typeof(isActive) !== 'undefined' && this.active !== isActive) {
      this.toggleActive()
    }
  }
  get isActive(): boolean { return this.active }

  @Output() commentDeleted = new EventEmitter<string>()
  @Output() commentActivation = new EventEmitter<boolean>()
  @Output() commentDeactivate: EventEmitter<any> = new EventEmitter<any>()
  @Output() expandLine = new EventEmitter<number>()
  @Output() collapseLine = new EventEmitter<number>()
  @Output() dismissKeyboard = new EventEmitter()
  @Output() commentUpdated: EventEmitter<any> = new EventEmitter()
  @Output() mobileActivation = new EventEmitter()
  @Output() mobileDeactivation = new EventEmitter()

  private showDeleteModal: boolean = false

  constructor(
        private _projects: ProjectService,
        private angulartics: Angulartics2,
        public el: ElementRef
      ) { }

  ngOnInit() {
    // Set initial values if passed
    if (this.comment.lineCount) {
      this.lineCount = this.comment.lineCount
    } 
    if (this.comment.expanded) {
      this.expanded = this.comment.expanded
    } 
  }

  toggleActive( ): void {
      if (!this.readOnly) {
        if (this.active === true) {
            //if (window.screen.availWidth < 768) {
              //this.mobileCommentDone()
            //}
            this.active = false
            this.commentActivation.emit(false)
            // Save when comment is toggled away from
            this.updateComment(this.comment.data)
        } else {
            //if (window.screen.availWidth < 768) {
              //this.mobileCommentFix()
              //console.log('toggleActivate')
            //}
            this.active = true 
            this.commentActivation.emit(true)
        }
      } else {
        this.togglePreview()
      }
      
  }

  activate(): void {
    if (!this.readOnly) {
      this.active = true
      this.commentActivation.emit(true)
    } else {
      this.togglePreview()
    }
  }

  togglePreview(): void {
      if (this.preview === true) {
        this.preview = false
        this.commentActivation.emit(false)
      } else {
        this.preview = true
      }
  }

  deactivate(): void {
    this.active = false
    this.commentActivation.emit(false)
    // Save when comment is toggled away from
    this.updateComment(this.comment.data)
  }

  // Updates comment in db
  public updateComment(commentData: string): void {
    this.angulartics.eventTrack.next({ action: 'updateComment', properties: { category: 'projectAction', label: 'attempt' }})
    this.isLoading = true

    this._projects.saveComment(this.comment.project_id, commentData, this.comment.start, this.comment.end, this.comment.type, this.comment.text, this.comment._id, this.comment.loc)
      .then(comment => {
        this.isLoading = false
        this.angulartics.eventTrack.next({ action: 'updateComment', properties: { category: 'projectAction', label: 'success' }})
        this.justSaved = true
        this.commentUpdated.emit()
        setTimeout(() => {
          this.justSaved = false
        }, 1000)
      })
      .catch(error => {
        // TRACK EXCEPTION
        this.angulartics.eventTrack.next({ action: 'updateComment', properties: { category: 'projectAction', label: 'failure' }})
        console.log(error)
      })
  }

  // Deletes comment via Project service, which updates the local Project object
  deleteComment(comment: any):void {
    this.angulartics.eventTrack.next({ action: 'deleteComment', properties: { category: 'projectAction', label: 'attempt' }})

    this._projects.deleteComment(comment)
      .then(data => {
        this.angulartics.eventTrack.next({ action: 'deleteComment', properties: { category: 'projectAction', label: 'success' }})
        // Tell Annotator to destroy this comment element!
        this.commentDeleted.emit(comment._id)
        this.showDeleteModal = false
      })
      .catch(error => {
        // TRACK EXCEPTION
        this.angulartics.eventTrack.next({ action: 'deleteComment', properties: { category: 'projectAction', label: 'failure' }})
        console.log(error)
      })
  }

  /**
   * Returns comment block's y position
   * - Used for collapse/expand multiple comments
   */
  public getVerticalPosition(): number {
    // The parentNode offsetTop addition fixes the occasional issue where diferrent images have comments registering on the same line
    this.yPos = Math.round(this.el.nativeElement.offsetTop) + Math.round(this.el.nativeElement.parentNode.offsetTop)
    return this.yPos
  }

  /**
   * Collapse all stacked comments on the same line
   */
  collapse(): void {
    this.collapseLine.emit(this.yPos)
  }

  /**
   * Expand all stacked comments on the same line
   */
  expand(): void {
    this.expandLine.emit(this.yPos)
  }

  // /**
  //  * iOS Text Comment Correction Activate
  //  */
  // mobileCommentFix(): void {
  //   // iOS scroll fix enable
  //   console.log('mcmt-active')
  //   this.currentScroll = document.body.scrollTop
  //   document.getElementsByTagName("body")[0].classList.add('disablePane');
  //   document.getElementsByTagName("body")[0].style["top"] = "-" + this.currentScroll + "px";
  //   this.mobileActivation.emit(this.yPos);
  // }

  // /**
  //  * iOS Text Comment Correction Deactivate
  //  */
  // mobileCommentDone(): void {
  //   // iOS scroll fix disable
  //   document.getElementsByTagName("body")[0].classList.remove('disablePane');
  //   document.getElementsByTagName("body")[0].removeAttribute("style");
  //   document.body.scrollTop = this.currentScroll;
  //   this.mobileDeactivation.emit(this.yPos);
  //   // Dismiss the keyboard in mobile
  //   this.dismissKeyboard.emit();
  //   console.log('mcmt-nactive');
  // }

}