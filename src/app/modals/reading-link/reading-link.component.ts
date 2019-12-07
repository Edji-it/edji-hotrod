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
  private _reading: Reading = { title: '', draft: false, _id: '', reading_type: 'private' }

  @Input('reading')
  set shareReading(reading: Reading) {
    if (reading) {
      this._reading = reading
      this.readingLink = `${location.origin}/#/discover?preview=${this._reading._id}`
    }
  }
  get shareReading(): Reading {
    return this._reading
  }
  @Input() public isCreator: boolean

  @Output() private closeModal: EventEmitter<boolean> = new EventEmitter()

  constructor() // imports
  {}

  ngOnInit() {}

  public close() {
    this.closeModal.emit(false)
  }
}
