import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'hot-reading-card',
  templateUrl: 'reading-card.component.html',
  styleUrls: ['./reading-card.component.scss']
})
export class ReadingCardComponent implements OnInit {
  @Input() reading: any;

  constructor() { }

  ngOnInit() { }
}