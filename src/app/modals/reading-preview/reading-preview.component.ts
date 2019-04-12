import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core'
import { Router } from '@angular/router'

// Project Dependencies
import { Reading } from 'src/app/shared/datatypes'

@Component({
  selector: 'hot-reading-preview-modal',
  templateUrl: 'reading-preview.component.pug',
  styleUrls: ['./reading-preview.component.scss']
})
export class ReadingPreviewModal implements AfterViewInit {
  @Input() reading: Reading
  @Output() closeModal: EventEmitter<any> = new EventEmitter()

  public initialized: boolean

  constructor(private _router: Router) {}

  ngAfterViewInit() {
    // Need to give the modal time to load before allowing the clickOutside binding to close the modal
    setTimeout(() => {
      this.initialized = true
    }, 1)
  }

  public goHome(): void {
    this._router.navigate(['/dashboard'])
  }

  /**
   * close the modal only if template has initialized
   */
  public close(): void {
    if (this.initialized) {
      this.closeModal.emit()
    }
  }
}
