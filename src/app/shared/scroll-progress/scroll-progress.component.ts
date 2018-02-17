import { Subscription } from 'rxjs/Rx'
import { ProjectService } from '../index'
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Input } from '@angular/core'

@Component({
  selector: 'scroll-progress',
  templateUrl: './scroll-progress.component.pug',
  styleUrls: ['./scroll-progress.component.scss']
})
export class ScrollProgressComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = []
  private lastWord: number = 0
  private scrollPosition: number = 0
  private scrollProgress: number = 0

  // Scroll progress inputs for calculation
  @Input() scrollMax: number
  @Input() 
  set currentScrollPosition(currentScrollPosition: number) {
    this.scrollPosition = currentScrollPosition
    this.updateScroll()
  }
  get currentScrollPosition(): number {
    return this.scrollPosition
  }

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

  private updateScroll() {
    this.scrollProgress = Math.ceil((this.scrollPosition / (this.scrollMax - (window.innerHeight * .6)))*100)
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }
}