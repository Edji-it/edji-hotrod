import { Component, Input, Output, EventEmitter, AfterViewInit, OnInit } from '@angular/core'
import { Router } from '@angular/router'

// Project Dependencies
import { Reading } from 'src/app/shared/datatypes'
import { ReadingService } from 'src/app/_services'

@Component({
  selector: 'hot-reading-preview-modal',
  templateUrl: 'reading-preview.component.pug',
  styleUrls: ['./reading-preview.component.scss']
})
export class ReadingPreviewModal implements AfterViewInit, OnInit {
  @Input() reading: Reading
  @Output() closeModal: EventEmitter<any> = new EventEmitter()

  public initialized: boolean

  constructor(
    private _router: Router,
    private _readings: ReadingService
  ) {}

  async ngOnInit() {
    // The Discover Feed only has the first 100 words, so we need to make a call to get the full reading to attach all words
    try {
      let fullReading: Reading
      fullReading = await this._readings.get(this.reading._id).toPromise()
      this.reading.words = fullReading.words
    } catch (err) {
      console.error(err)
    }
  }

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
   * Returns whether a "w" word contains a style class
   * @param w Word object
   */
  public wHasStyle(w, style): boolean {
    return w && w.styles && w.styles.indexOf(style) > -1
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
