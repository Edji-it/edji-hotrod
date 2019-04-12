import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'

// Project Dependencies
import { Reading } from 'src/app/shared/datatypes'

@Component({
  selector: 'hot-reading-preview-modal',
  templateUrl: 'reading-preview.component.pug',
  styleUrls: ['./reading-preview.component.scss']
})
export class ReadingPreviewModal {
  @Input() reading: Reading

  constructor(private _router: Router) {}

  public goHome(): void {
    this._router.navigate(['/dashboard'])
  }
}
