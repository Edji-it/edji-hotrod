import { Subscription } from 'rxjs/Rx'
import { ProjectService } from '../index'
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit } from '@angular/core'

@Component({
  selector: 'scroll-progress',
  templateUrl: './scroll-progress.component.pug',
  styleUrls: ['./scroll-progress.component.scss']
})
export class ScrollProgressComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = []
  private lastWord: number = 0

  constructor(
    private _projects: ProjectService
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this._projects.lastWordUpdateState.subscribe(
          (lastWord) => {
            this.lastWord = lastWord
          }
        )
      )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }
}