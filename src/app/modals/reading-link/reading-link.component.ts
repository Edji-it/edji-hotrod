import { Subscription } from 'rxjs'
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core'
import { take } from 'rxjs/operators'

// Project Dependencies
import { Project, User, Reading } from '../../shared/datatypes'

@Component({
  selector: 'edji-reading-link',
  templateUrl: './reading-link.component.pug',
  styleUrls: ['./reading-link.component.scss'],
})
export class ReadingLinkModal implements OnInit {
  public readingLink: string

  @Input('reading') public shareReading: Reading
  @Input() public isCreator: boolean

  @Output() private closeModal: EventEmitter<boolean> = new EventEmitter()

  constructor() // imports
  {}

  ngOnInit() {
    this.readingLink = `${location.origin}/#/discover?preview=${this.shareReading._id}`
  }

  public close() {
    this.closeModal.emit(false)
  }
}
