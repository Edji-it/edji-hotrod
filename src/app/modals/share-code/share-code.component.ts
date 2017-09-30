import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UtilToolService } from './../../shared'

@Component({
  selector: 'share-code',
  templateUrl: 'share-code.component.pug',
  styleUrls: ['./share-code.component.scss']
})
export class ShareCodeComponent implements OnInit {

  @Input()
  private showOpenReading: boolean
  
  @Output()
  private closeModal: EventEmitter<any> = new EventEmitter()
  
  private codeLetters: any

  constructor(
    private router: Router,
    private _util: UtilToolService
  ) {
    
  }

  ngOnInit() {
    
  }

  private isNumber(val) {
    return !isNaN(parseFloat(val)) && isFinite(val)
  }

  private navProject(project_id) {
    this._util.shareCodeModalClose()
    this.router.navigate(['project', project_id])
  }

  private navDashboard() {
    this._util.shareCodeModalClose()
    this.router.navigate(['dashboard'])
  }
}