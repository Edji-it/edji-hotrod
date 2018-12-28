import { Component } from '@angular/core'
import { Router } from '@angular/router'

// Project Dependencies

@Component({
  selector: 'hot-reading-archived-modal',
  templateUrl: 'reading-archived.component.pug'
})
export class ReadingArchivedModal {

  constructor(
    private _router: Router
  ) {}

  public goHome(): void {
    this._router.navigate(['/dashboard'])
  }
}