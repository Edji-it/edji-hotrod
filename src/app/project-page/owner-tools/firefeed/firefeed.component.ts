import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'hot-firefeed',
  templateUrl: 'firefeed.component.html',
  styleUrls: ['./firefeed.component.scss']
})

export class FirefeedComponent implements OnInit {
  @Input() visible: boolean = false
  @Output() hide: EventEmitter<any> = new EventEmitter()

  constructor() { }

  ngOnInit() { }
}