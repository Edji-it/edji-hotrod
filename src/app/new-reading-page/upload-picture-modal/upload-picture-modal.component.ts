import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Locker } from 'angular2-locker';

// Project Dependencies
import { AuthService, MediaService } from '../../shared';

@Component({
  selector: 'upload-picture-modal',
  templateUrl: './upload-picture-modal.component.html',
  styleUrls: ['./upload-picture-modal.component.scss']
})
export class UploadModalComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Output() returnImage: EventEmitter<any> = new EventEmitter();
  
  private uploadedImages: any[] = [];
  private newImgUrls: string[] = [];
  private selectedIndex: number = 0;
  private locker: any;
  private file: any = {};
  private uploading: boolean = false;
  private uploadUrl: string = '//grapple-dev.edji.it';

  private noUploadAllowed: boolean = true;
  private errorMsg: string = '';

  constructor(private _locker: Locker, private _media: MediaService, private _auth: AuthService) {
    this.locker = _locker.useDriver(Locker.DRIVERS.LOCAL);
  }

  ngOnInit() {
    // Load previously uploaded images
    if (this._auth.getUser().media && this._auth.getUser().media.images) {
      this.uploadedImages = this._auth.getUser().media.images
    }

    // Get the latest uploaded pics
    this._auth.refreshUser().take(1).subscribe(user => {
      this.uploadedImages = user.media.images
    })
  }

  /**
   * Set 'file' variable and validate file
   */
  updateUploadFile() {
    const files = document.getElementById('imageFileInput')['files'];
    this.file = files[0];
    // Limit file size to 5mb
    if (this.file && this.file.size > 5 * Math.pow(10, 6) ) {
      this.noUploadAllowed = true;
      this.errorMsg = 'Image uploads are limited to 5mb, please select a smaller image';
    } else {
      this.noUploadAllowed = false;
      this.errorMsg = '';
    }
  }

  /**
   * Upload image and add image to modal for selection
   */
  beginUpload() {
    this.updateUploadFile();

    if(this.file == null || this.noUploadAllowed){
      alert('No file selected.');
      return;
    }

    this.uploading = true;

    this._media.uploadImage(this.file)
      .subscribe(data => {
        this.uploading = false;
        this.addUploadUrl(data.url);
        this.file = {};
      }, error => {
        this.uploading = false;
      });
  } // beginUpload() 

  

  /**
   * Add upload URL to array and localStorage
   */
  addUploadUrl(url: string, title ?: string) : void {
    let imgObj = {
      url: url,
      title: title
    };

    this.newImgUrls.unshift(url);
    this.uploadedImages.unshift(imgObj);
    this.locker.set('uploadedImages', this.uploadedImages);

    let user = this._auth.getUser();
    if (!user.media) {
        user.media = {};
    }
    if (!user.media.images) {
        user.media.images = [];
    }
    user.media.images = this.uploadedImages
    this._auth.updateUser( user )
        .take(1)
        .subscribe(
          (user) => {
            if (user.media) {
              this.uploadedImages = user.media.images
            }
          },
          (error) => {
            console.log(error)
          }
        );
  } // addUploadUrl

  insertImage(imageIndex: number) : void {
    this.returnImage.emit([this.uploadedImages[imageIndex]]);
    this.closeModal.emit();
  } // insertImage
}