import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'hot-firecard',
  templateUrl: 'firecard.component.html',
  styleUrls: ['firecard.component.scss']
})

export class FirecardComponent implements OnInit {

  @Input() fireComment: Comment

  constructor() { }

  ngOnInit() { }
}