import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core'
import { ProjectService } from 'app/shared'
import { Subscription } from 'rxjs'
import { EdjiComment } from 'app/shared/datatypes'

@Component({
    selector: 'avatar-portal',
    templateUrl: 'avatar-portal.component.pug',
    styleUrls: ['./avatar-portal.component.scss']
})
export class AvatarPortalComponent implements OnInit, OnDestroy {
  
  private subscriptions: Subscription[] = []
  private commentsByPos: any = []
    
  @Input() private lineCount: Number = 1
  @Input() private active: boolean = false
  @Input() private lineY: Number = 0
  @Input() public comment: EdjiComment
  @Input() public indexOnLine: Number = 1

  @Output() toggleCommentPane = new EventEmitter()

  constructor (private _projects: ProjectService) { 
      
  }

  ngOnInit() {
    this.subscriptions.push(this._projects.commentByPos.subscribe(
      (commentsByPos) => {
        this.commentsByPos = commentsByPos
      }
    ))
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }
}