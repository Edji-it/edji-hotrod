import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CommentStats } from './../../../shared/datatypes'

@Component({
  selector: 'hot-leaderboard',
  templateUrl: 'leaderboard.component.html'
})

export class LeaderboardComponent implements OnInit {
  @Input() visible: boolean = false
  @Output() hide: EventEmitter<any> = new EventEmitter()

  @Input() commentStats: CommentStats

  constructor() { }

  ngOnInit() { }
}