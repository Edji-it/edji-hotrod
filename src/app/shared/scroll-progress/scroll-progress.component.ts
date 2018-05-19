import { Subscription } from 'rxjs'
import { ProjectService } from '../index'
import { Component, EventEmitter, OnInit, Input } from '@angular/core'

@Component({
  selector: 'scroll-progress',
  template: require('pug-loader!./scroll-progress.component.pug'),
  styleUrls: ['./scroll-progress.component.scss']
})
export class ScrollProgressComponent implements OnInit {

  private subscriptions: Subscription[] = []
  // Scroll progress as a percent, 0-100
  private _scrollProgress: number = 0

  // Scroll progress inputs for calculation
  @Input() 
  set scrollProgress(progress: number) {
    this._scrollProgress = Math.ceil(progress)
  }
  get scrollProgress(): number {
    return this._scrollProgress
  }

  constructor(
    private _projects: ProjectService
  ) { }

  ngOnInit() {
  }
}