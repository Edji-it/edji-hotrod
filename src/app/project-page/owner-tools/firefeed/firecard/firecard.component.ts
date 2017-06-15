import { Subscription } from 'rxjs/Rx';
import { EdjiComment, Reading } from '../../../../shared/datatypes';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ReadingService } from '../../../../shared/reading.service';


@Component({
  selector: 'hot-firecard',
  templateUrl: 'firecard.component.html',
  styleUrls: ['firecard.component.scss']
})

export class FirecardComponent implements OnInit, OnDestroy {

  @Input() fireComment: EdjiComment
  // @Input() currentReading: Reading

  private yPos: number = 0
  private isImage: boolean = false
  private currentReading: Reading
  private subscriptions: Subscription[] = []

  constructor(
    public el: ElementRef,
    private _readings: ReadingService
  ) { }

  ngOnInit() { 
    this.subscriptions.push(
      this._readings.currentReading.subscribe(
        reading => {
          if (reading._id) {
             this.currentReading = reading
            if (this.currentReading.words[this.fireComment.start] && this.currentReading.words[this.fireComment.start].styles[0]==='img') {
              this.isImage = true
            }
          }
        },
        error => {
          console.error(error);
        }
      )
    )
  }

  public getOffset(el) {
    el = el.getBoundingClientRect();
    return {
      left: el.left + window.scrollX,
      top: el.top + window.scrollY
    }
  }

  public getImagePos(imageIndex) {
    let yOffset = 100
    let imageElement = document.getElementById("readingImage" + imageIndex)
    this.yPos = this.getOffset(imageElement).top
    window.scrollTo(0, this.yPos - yOffset)
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }
}