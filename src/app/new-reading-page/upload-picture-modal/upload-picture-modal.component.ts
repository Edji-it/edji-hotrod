import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Locker } from 'angular2-locker';

// Project Dependencies
import { MediaService } from '../../shared/media.service';

@Component({
  selector: 'upload-picture-modal',
  templateUrl: './upload-picture-modal.component.html',
  styleUrls: ['./upload-picture-modal.component.scss'],
  providers: [
    MediaService
  ]
})
export class UploadModalComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Output() returnImage: EventEmitter<any> = new EventEmitter();
  
  private uploadedUrls: string[] = [];
  private newImgUrls: string[] = [];
  private selectedIndex: number = 0;
  private locker: any;
  private file: any = {};
  private uploading: boolean = false;
  private uploadUrl: string = '//grapple-dev.edji.it';

  constructor(private _locker: Locker, private _media: MediaService) {
    this.locker = _locker.useDriver(Locker.DRIVERS.LOCAL);
  }

  ngOnInit() {
    // Load previously uploaded images
    if (this.locker.get('uploadedImageUrls')) {
      this.uploadedUrls = this.locker.get('uploadedImageUrls');
    }
  }

  /**
   * Set 'file' variable
   */
  updateUploadFile() {
    const files = document.getElementById('imageFileInput')['files'];
    this.file = files[0];
  }

  /**
   * Upload image and add image to modal for selection
   */
  beginUpload() {
    this.updateUploadFile();

    if(this.file == null){
      alert('No file selected.');
      return;
    }

    this.uploading = true;

    this._media.uploadImage(this.file)
      .subscribe(data => {
        this.uploading = false;
        this.addUploadUrl(data.url);
      }, error => {
        this.uploading = false;
      });
  }

  

  /**
   * Add upload URL to array and localStorage
   */
  addUploadUrl(url: string) : void {
    this.newImgUrls.unshift(url);
    this.uploadedUrls.unshift(url);
    while(this.uploadedUrls.length > 5) {
      this.uploadedUrls.pop();
    }
    this.locker.set('uploadedImageUrls', this.uploadedUrls);
  }

  insertImage(imageIndex: number) : void {
    this.returnImage.emit(this.uploadedUrls[imageIndex]);
    this.closeModal.emit();
  }
}