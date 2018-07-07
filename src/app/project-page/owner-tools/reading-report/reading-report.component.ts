import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'hot-reading-report',
  templateUrl: './reading-report.component.pug',
  styleUrls: ['./reading-report.component.scss']
})
export class ReadingReportComponent implements OnInit {
  @Input() visible: boolean = false
  @Output() hide: EventEmitter<any> = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

}
