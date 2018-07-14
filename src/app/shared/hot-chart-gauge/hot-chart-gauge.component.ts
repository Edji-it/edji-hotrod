import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, animate, transition, style, keyframes } from '@angular/animations';

@Component({
  selector: 'hot-chart-gauge',
  templateUrl: './hot-chart-gauge.component.pug',
  styleUrls: ['./hot-chart-gauge.component.scss'],
  animations: [
    trigger('animateToolTip', [
      state('start', style({
        transform: 'rotate(0deg) translate(0px) rotate(0deg)'
      })),
      state('stop', style({
        transform: 'rotate({{avgAngle}}deg) translate({{avgLft}}px, {{avgBtm}}px) rotate(-{{avgAngle}}deg)'
      }), {params: {avgAngle: 0, avgLft: 0, avgBtm: 0}}),
      transition('start => stop', animate('2000ms ease-in'))
    ])
  ]
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
  public avgLft: number = 0
  public avgBtm: number = 0
  public avgAngle: number = 0
  public animationState: string = 'start'

  constructor() { }

  ngOnInit() {
    this.animationState = 'stop'
    this.measures = {
      full: 'Minutes Reading',
      abbreviated: 'min'
    }
    this.values = {
      min: 10,
      max: 40,
      avg: 32,
      val: 23
    }
    setTimeout(()=> {
      // needle position has a range between -90 and 90, needs to be extrapolated from the min, max, and val values
      this.needlePosition = (((this.values.val - this.values.min) / (this.values.max - this.values.min)) * 180) - 90

      // average line position has a range between -90 and 90, needs to be extrapolated from the min, max, and avg values
      this.averagePosition = (((this.values.avg - this.values.min) / (this.values.max - this.values.min)) * 180) - 90

      // average box position needs to be moved on a coordinate scale (0,0 is -x,0 . Middle is 0,x and right is 2x,0)
      // Calculate the angle of the average position
      this.avgAngle = (((this.values.avg - this.values.min) / (this.values.max - this.values.min)) * 180)
      const avgAngleRad = this.avgAngle * (Math.PI / 180)
      const correctionFactor = (this.chartSize / 2)
      // horizontal placement
      if (this.avgAngle>=90) {
        this.avgLft = -(Math.abs(Math.round((((this.chartSize + 12)/2) * Math.cos(avgAngleRad)))) + correctionFactor)
      } else {
        this.avgLft = -Math.abs(Math.round(((((this.chartSize + 12)/2) * (1-Math.cos(avgAngleRad))))))
      }
      // vertical placement
      if (this.avgAngle>=90) {
        this.avgBtm = -Math.abs(Math.round((((this.chartSize + 12)/2) * Math.sin(avgAngleRad))))
      } else {
        this.avgBtm = -(Math.abs(Math.round((((this.chartSize + 12)/2) * Math.sin(avgAngleRad)))) - 4)
      }
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