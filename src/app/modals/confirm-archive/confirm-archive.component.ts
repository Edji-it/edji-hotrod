import { Component, Output, EventEmitter, Input } from '@angular/core'

// Project Dependencies
import { Reading } from 'src/app/shared/datatypes'

@Component({
  selector: 'hot-confirm-archive-modal',
  templateUrl: 'confirm-archive.component.pug',
})
export class ConfirmArchiveModal {
  @Output() closeModal: EventEmitter<any> = new EventEmitter()
  @Output() confirmArchive: EventEmitter<any> = new EventEmitter()
  @Output() declineArchive: EventEmitter<any> = new EventEmitter()
  @Output() goHero: EventEmitter<any> = new EventEmitter()

  @Input() public readingToArchive: Reading

  constructor() {}
}
