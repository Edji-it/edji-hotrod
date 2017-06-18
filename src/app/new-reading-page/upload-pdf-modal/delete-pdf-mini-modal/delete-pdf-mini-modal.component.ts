import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'delete-pdf-mini-modal',
  templateUrl: './delete-pdf-mini-modal.component.html',
  styleUrls: ['./delete-pdf-mini-modal.component.scss'],
})

export class DeletePdfMiniModal implements OnInit {

  /*
  17 June 2017
  Created By:     Nick Pumper
  Last modified:  17 June 2017
  
  A little modal when the user decides to delete a PDF.
  */

  // private showModal : boolean = false;
  private relevantDoc : any;

  @Output() confirm = new EventEmitter<any>()
  @Output() dismiss = new EventEmitter<any>()

  constructor() {}

  ngOnInit() {}

  /*
  6.17.17
  Trigger the process for the user to confirm that they want to delete a PDF.
  */
  public confirmDeleteMiniModal () : void
  {
      // this.showModal = true;
  } // confirmDeleteMiniModal ()
}