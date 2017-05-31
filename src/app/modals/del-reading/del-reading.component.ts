import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReadingService } from '../../shared';
import { Reading }        from '../../shared/datatypes';

@Component({
  selector: 'hot-del-reading',
  templateUrl: 'del-reading.component.html'
})
export class DeleteReadingModal implements OnInit {

  /*
  27 May 2017
  by Nick Pumper
  
  A prompt asking if we really want to delete a reading.
  If no, it closes. Otherwise it deletes it.
  */


  @Output()
  closeModal: EventEmitter<any> = new EventEmitter(); // Tell the listening page to close the darned thing.
  @Output()
  deleteReading: EventEmitter<any> = new EventEmitter(); // Tell the listening page to enact the delete procedures. This is done in reading-card and reading.service
  @Output() 
  renewReadings : EventEmitter<string> = new EventEmitter<string>(); // pass up to reading-card.component

  @Input()
  // We need the reading info because we want to say the reading title in the prompt
  reading : Reading;

  public showError : boolean = false;

  constructor(
   private _readings : ReadingService;
  ) { }

  ngOnInit() { }
  
  // upon recieving a deleteReading event, our del-reading modal will trigger this
  deleteThisReading(reading : Reading) : void {
    // Listen for an Observable from reading.service.ts
    this._readings.delete(reading)
      .take(1) // so we don't need to unsubscribe
      .subscribe(
      data => { 
        console.log("Deleting the reading was successful.");
        this.renewReadings.emit(reading._id);
      },
      err => {
        this.showError = true;
    })
    // console.log("[reading-card.component.ts] deleteReading() worked!");
  } // deleteReading(reading : Reading)

} // class DeleteReadingModule