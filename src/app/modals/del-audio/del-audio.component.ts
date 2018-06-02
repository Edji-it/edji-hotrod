import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'hot-del-audio',
  templateUrl: 'del-audio.component.html',
  styleUrls: ['del-audio.component.scss']
})
export class DeleteAudioModal implements OnInit {
  @Output()
  closeModal: EventEmitter<any> = new EventEmitter()
  @Output()
  delete: EventEmitter<any> = new EventEmitter()

  @Input()
  comment: any

  public showError = false

  constructor() { }

  ngOnInit() { }
}
