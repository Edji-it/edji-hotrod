import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { UtilToolService } from './..'

@Component({
  selector: 'share-code',
  templateUrl: 'share-code.component.pug',
  styleUrls: ['./share-code.component.scss']
})
export class ShareCodeComponent implements OnInit {

  @Output()
  private closeModal: EventEmitter<any> = new EventEmitter()
  
  private codeLetters: any

  constructor(
    private _util: UtilToolService
  ) {
    
  }

  ngOnInit() {
    
  }

  private isNumber(val) {
    return !isNaN(parseFloat(val)) && isFinite(val)
  }
}