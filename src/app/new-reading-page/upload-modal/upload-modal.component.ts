import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'upload-modal',
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.scss']
})
export class UploadModalComponent implements OnInit {

  @Output()
  closeModal: EventEmitter<any> = new EventEmitter();
  
  constructor() { }

  ngOnInit() {
    
  }

}