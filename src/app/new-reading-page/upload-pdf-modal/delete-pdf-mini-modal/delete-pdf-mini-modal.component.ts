import { Component, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'delete-pdf-mini-modal',
  templateUrl: './delete-pdf-mini-modal.component.pug',
  styleUrls: ['./delete-pdf-mini-modal.component.scss'],
})
export class DeletePdfMiniModal {
  private relevantDoc: any

  @Output() confirm = new EventEmitter<any>()
  @Output() dismiss = new EventEmitter<any>()

  constructor() { }
}