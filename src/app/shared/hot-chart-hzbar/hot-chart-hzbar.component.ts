import { Component, OnInit, Input } from '@angular/core';

// Project Dependancies
import { EdjiComment } from '../datatypes';

@Component({
  selector: 'hot-chart-hzbar',
  templateUrl: './hot-chart-hzbar.component.pug',
  styleUrls: ['./hot-chart-hzbar.component.scss']
})
export class HotChartHzbarComponent implements OnInit {

  @Input() comments: EdjiComment[]

  private commentCountByType: any = {}

  constructor() { }

  ngOnInit() {
    if (this.comments && this.comments.length>0) {
      // Build a breakdown of counts by comment type
      const arrLength = this.comments.length
      for (let i=0; i<arrLength; i++) {
        let comment = this.comments[i]
        let commentType = comment.type

        if (comment.reply_to && comment.reply_to.length > 0) {
          commentType = 'reply'
        }

        this.commentCountByType[commentType] = (this.commentCountByType[commentType] + 1) || 1
      }
    }
  }

}
