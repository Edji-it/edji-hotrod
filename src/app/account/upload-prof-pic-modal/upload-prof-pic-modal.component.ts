import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../shared';

@Component({
  selector: 'hot-upload-prof-pic',
  styleUrls: ['./upload-prof-pic-modal.scss'],
  templateUrl: 'upload-prof-pic-modal.component.html'
})
export class UploadProfPicModal implements OnInit {

  /*
  23 June 2017
  by Nick Pumper
  Last Mod: 23 June 2017
  
  A prompt asking if we really want to delete a project.
  If no, it closes. Otherwise. it deletes it.
  */

  // For closing this modal.
  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  public uploadedFile : any;

  public image      : any = "./../../assets/test-profile-pic/Rick-astley.jpg"; // The image we want to upload;
  public showError  : boolean = false;

  constructor(private _auth : AuthService) {
    this.uploadedFile = this.image;
    console.log(this.image.constructor.name);
  } // constructor
 
  ngOnInit() { }

  public updateUploadFile() : void
  {

  } // public updateUploadFile() void

} // class UploadProfPicModal