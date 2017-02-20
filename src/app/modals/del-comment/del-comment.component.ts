import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'hot-del-comment',
  templateUrl: 'del-comment.component.html'
})
export class DeleteCommentModal implements OnInit {
  @Output()
  closeModal: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() { }
}