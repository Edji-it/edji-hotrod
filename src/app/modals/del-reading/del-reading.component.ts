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

  @Input()
  // We need the reading info because we want to say the reading title in the prompt
  reading : Reading;

  public showError : boolean = false;

  constructor( ) { }

  ngOnInit() { }
  
} // class DeleteReadingModule