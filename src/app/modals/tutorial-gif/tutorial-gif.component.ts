import { Component, Output, EventEmitter, Input } from '@angular/core'

// Project Dependencies


@Component({
  selector: 'edji-tutorial-gif',
  templateUrl: 'tutorial-gif.component.pug',
  styleUrls: ['tutorial-gif.component.scss']
})
export class TutorialGifModalComponent {
  @Input() header: string = 'Tutorial'
  @Input() gif: string = ''
  @Input() description: string = ''
  
  @Output()
  closeModal: EventEmitter<any> = new EventEmitter()


  constructor() {

  }


  /**
   * Close modal
   */
  public close(): void {
    // Trigger close
    this.closeModal.emit()
  }
}
