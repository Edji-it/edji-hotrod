import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { take } from 'rxjs/operators'

// Project Dependencies
import { ReadingService } from '../../_services'
import { Reading } from '../../shared/datatypes'

@Component({
  selector: 'hot-del-reading',
  templateUrl: './del-reading.component.pug',
})
export class DeleteReadingModal implements OnInit {
  /*
  27 May 2017
  by Nick Pumper
  
  A prompt asking if we really want to delete a reading.
  If no, it closes. Otherwise it deletes it.
  */

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter() // Tell the listening page to close the darned thing.
  @Output()
  deleteReading: EventEmitter<any> = new EventEmitter() // Tell the listening page to enact the delete procedures. This is done in reading-card and reading.service

  @Input()
  // We need the reading info because we want to say the reading title in the prompt
  reading: Reading

  public showError: boolean = false

  constructor(private _readings: ReadingService) {}

  ngOnInit() {}

  // upon recieving a deleteReading event, our del-reading modal will trigger this
  deleteThisReading(reading: Reading): void {
    // Listen for an Observable from reading.service.ts
    this._readings
      .delete(reading)
      .pipe(take(1)) // so we don't need to unsubscribe
      .subscribe(
        data => {
          // console.log("Deleting the reading was successful.");
          // Data is updated through observables on the Reading service
        },
        err => {
          this.showError = true
        },
      )
  }
}
