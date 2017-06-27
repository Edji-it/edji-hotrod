import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// Dependencies
import { AuthService, MediaService } from '../../shared';

@Component({
  selector: 'hot-upload-prof-pic',
  styleUrls: ['./upload-prof-pic-modal.scss'],
  templateUrl: 'upload-prof-pic-modal.component.html',
  providers: [
    MediaService
  ]
})
export class UploadProfPicModal implements OnInit {

  /*
  23 June 2017
  by Nick Pumper
  Last Mod: 27 June 2017
  
  A prompt asking if we really want to delete a project.
  If no, it closes. Otherwise. it deletes it.

  The user's avatar is stored in _auth.getUser().
  */

  // For closing this modal.
  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  public uploadedFile : any;

  public image      : any = "./../../assets/test-profile-pic/Rick-astley.jpg"; // The image we want to upload;
  public showError  : boolean = false;

  constructor(private _media: MediaService, private _auth: AuthService) {
    this.uploadedFile = this.image;
    console.log(this.image.constructor.name);
  } // constructor
 
  ngOnInit() { }

  public updateUploadedFile() : void
  {
    // In our upload process, we're just gonna use the s3 bucket
    // in media.service

    const files = document.getElementById('uploadImageInput')['files'];
    console.log("We are uploading.");

    let file = files[0];
    console.log(file);
    console.log(file.size + " is being compared to " + (5 * Math.pow(10, 6)));

    // Limit file size to 5mb
    if (file && file.size < 5 * Math.pow(10, 6) ) {
      // Begin the image upload to the bucket
      this._media.uploadImage(file)
        .subscribe(data => {
          // Begin Upload of the image's URL
          this.uploadedFile = data.url;
        }, error => {
          console.log("Upload failure (2)");
        });
    } else {
      console.log("Upload failure. Either the image was null or too big.");
    }
  } // public updateUploadFile() void

  public getSelectedImage () : any 
  {
    return this.uploadedFile;
  } // public getSelectedImage () : any 

} // class UploadProfPicModal