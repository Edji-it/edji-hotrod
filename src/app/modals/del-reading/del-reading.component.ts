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
  */

  private readingService : ReadingService;

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter();
  @Output()
  delete: EventEmitter<any> = new EventEmitter();

  @Input()
  reading : Reading;

  constructor() { }

  ngOnInit() { }

  
} // class DeleteReadingModule