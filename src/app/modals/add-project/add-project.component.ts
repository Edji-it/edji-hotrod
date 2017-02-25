import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'hot-add-project-modal',
  templateUrl: 'add-project.component.html'
})
export class AddProjectModal implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  @Input() reading: any;

  constructor() { }

  ngOnInit() { }
}