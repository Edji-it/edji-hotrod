import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { Reading } from 'src/app/shared/datatypes';

// Project Dependencies

@Component({
  selector: 'hot-confirm-archive-modal',
  templateUrl: 'confirm-archive.component.pug'
})
export class ConfirmArchiveModal implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter()
  @Output() confirmArchive: EventEmitter<string> = new EventEmitter()
  @Output() declineArchive: EventEmitter<any> = new EventEmitter()
  @Output() goHero: EventEmitter<any> = new EventEmitter()

  public readingToArchive: Reading = {
    title: 'Example',
    draft: false,
    _id: 'fakeId',
  }

  constructor(
    
    ) {
  }

  ngOnInit() {

  }
}