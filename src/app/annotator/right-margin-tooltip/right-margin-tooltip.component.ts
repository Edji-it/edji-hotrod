import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'right-margin-tooltip',
  templateUrl: './right-margin-tooltip.component.html',
  styleUrls: ['./right-margin-tooltip.component.scss']
})
export class RightMarginTooltipComponent implements OnInit {

  @Input() private pageObjs: any[];

  private pageNo: number = 1;

  @Output() pageChange :  EventEmitter<any>;
  @Output() dismiss :  EventEmitter<any>;
     
  @Input() set pager(pageNo: number) {
    this.pageNo = pageNo;
  }
  get pager(){
      return this.pageNo; 
  }

  public increment(){
      this.pageNo = this.pageNo+1; 
      this.pageChange.emit(this.pageNo);
  }

  public decrement(){
      this.pageNo = this.pageNo - 1; 
      this.pageChange.emit(this.pageNo);
  }

  constructor(){
      this.pageChange = new EventEmitter();
      this.dismiss = new EventEmitter();
  }

  ngOnInit() {
  }

}