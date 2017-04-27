import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'right-margin-tooltip',
  templateUrl: './right-margin-tooltip.component.html',
  styleUrls: ['./right-margin-tooltip.component.scss']
})
export class RightMarginTooltipComponent implements OnInit {

  @Input() private pageObjs: any[];

  private index: number = 0

  constructor() { }

  ngOnInit() {
  }

}