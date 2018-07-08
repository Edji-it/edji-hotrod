import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'hot-chart-gauge',
  templateUrl: './hot-chart-gauge.component.pug',
  styleUrls: ['./hot-chart-gauge.component.scss']
})
export class HotChartGaugeComponent implements OnInit {
  // Set the chart size from the parent component
  @Input() chartSize: number = 150
  // Pass in the chart values per the interface
  @Input() values: Values
  // Override the color gradient on the chart
  @Input() colorLeft: string = '#F8954D'
  @Input() colorRight: string = '#D0FFB3'
  @Input() measures: Measures

  public needlePosition: number = -90
  public averagePosition: number = -90

  constructor() { }

  ngOnInit() {
    this.measures = {
      full: 'Minutes Reading',
      abbreviated: 'min'
    }
    this.values = {
      min: 10,
      max: 37,
      avg: 18,
      val: 23
    }
    setTimeout(()=> {
      // needle position has a range between -90 and 90, needs to be extrapolated from the min, max, and val values
      this.needlePosition = (((this.values.val - this.values.min) / (this.values.max - this.values.min)) * 180) - 90

      this.averagePosition = (((this.values.avg - this.values.min) / (this.values.max - this.values.min)) * 180) - 90
    }, 1)
  }
}

/**
 * min and max for the end bounds, avg for the tooltip value and val for the needle value
 */
interface Values {
  min: number
  max: number
  avg: number
  val: number
}

/**
 * measures are the text we will associate with the chart; both full and abbreviated
 */
interface Measures {
  full: string
  abbreviated: string
}