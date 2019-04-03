import { Component, OnInit, Input } from '@angular/core'

// Project Dependancies
import { EdjiComment } from '../datatypes'

@Component({
  selector: 'hot-chart-hzbar',
  templateUrl: './hot-chart-hzbar.component.pug',
  styleUrls: ['./hot-chart-hzbar.component.scss'],
})
export class HotChartHzbarComponent implements OnInit {
  @Input() commentCountByType: any

  constructor() {}

  ngOnInit() {}

  // For displaying the count icons next to each comment type
  public counter(i: number) {
    if (i < 26) {
      return new Array(i)
    } else {
      return new Array(25)
    }
  }
}
