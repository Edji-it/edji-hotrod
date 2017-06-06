import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CommentStats } from './../../../shared/datatypes'

@Component({
  selector: 'hot-firefeed',
  templateUrl: 'firefeed.component.html',
  styleUrls: ['./firefeed.component.scss']
})

export class FirefeedComponent implements OnInit {
  @Input() visible: boolean = false
  @Output() hide: EventEmitter<any> = new EventEmitter()

  private fireComment: any = {
      'user': 'Josh Kyburz',
      'comment': 'This is a sample comment',
      'words': 'This is a sample set of words',
      'title': 'Reading Title'
  }

  constructor() { }

  ngOnInit() { }
}