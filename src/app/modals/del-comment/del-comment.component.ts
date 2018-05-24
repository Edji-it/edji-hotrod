import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'hot-del-comment',
  templateUrl: 'del-comment.component.html'
})
export class DeleteCommentModal implements OnInit {
  @Output()
  closeModal: EventEmitter<any> = new EventEmitter();
  @Output()
  delete: EventEmitter<any> = new EventEmitter();

  @Input()
  comment: any;

  public showError: boolean = false

  constructor() { }

  ngOnInit() { 
    
  }
}