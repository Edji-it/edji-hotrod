import { Subscription } from 'rxjs'
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, AfterViewInit } from '@angular/core'

// Internal
import { EdjiComment, Reading } from '../../../../shared/datatypes'
import { ReadingService, SocketService } from '../../../../_services'
import { ProjectStore } from 'src/app/_store'

@Component({
  selector: 'hot-questioncard',
  templateUrl: 'questioncard.component.html',
  styleUrls: ['questioncard.component.scss'],
})
export class QuestioncardComponent implements OnInit, OnDestroy {
  @Input() questionBlock: EdjiComment
  // @Input() readingRef: Reading

  private currentReading: Reading
  private subscriptions: Subscription[] = []
  public answersHidden: boolean
  public answersById: any = {}

  constructor(
    private projectStore: ProjectStore,
    public el: ElementRef,
    private _readings: ReadingService,
    private _socket: SocketService,
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this._readings.currentReading.subscribe(
        reading => {
          if (reading._id) {
            this.currentReading = reading
          }
        },
        error => {
          console.error(error)
        },
      ),
    )

    // Subscribe to comment comment updates
    this.subscriptions.push(
      this._socket.commentUpdates.subscribe(
        commentUpdate => {
          let comment = commentUpdate.comment
          // Process different live comment updates
          if (commentUpdate.action === 'DELETE') {
          } else if (commentUpdate.action === 'UPDATE') {
          } else if (commentUpdate.action === 'CREATE') {
          }
        },
        error => {
          console.warn(error)
        },
      ),
    )

    // Subscribe to updates to the answer reference object
    this.subscriptions.push(
      this.projectStore.answersById.subscribe(
        answersById => {
          this.answersById = answersById
        },
        error => {
          console.error(error)
        },
      ),
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }
}
