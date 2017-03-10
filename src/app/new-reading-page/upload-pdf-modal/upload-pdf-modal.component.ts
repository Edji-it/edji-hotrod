import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Locker } from 'angular2-locker';

// Project Dependencies
import { MediaService } from '../../shared/media.service';

@Component({
  selector: 'upload-pdf-modal',
  templateUrl: './upload-pdf-modal.component.html',
  styleUrls: ['./upload-pdf-modal.component.scss']
})
export class UploadPdfModalComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Output() returnImage: EventEmitter<any> = new EventEmitter();
  
  private uploadedPdfUrls: string[] = [];
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
    if (this.locker.get('uploadedPdfUrls')) {
      this.uploadedPdfUrls = this.locker.get('uploadedPdfUrls');
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
    this.uploadedPdfUrls.unshift(url);
    while(this.uploadedPdfUrls.length > 5) {
      this.uploadedPdfUrls.pop();
    }
    this.locker.set('uploadedPdfUrls', this.uploadedPdfUrls);
  }

  insertImage(imageIndex: number) : void {
    this.returnImage.emit(this.uploadedPdfUrls[imageIndex]);
    this.closeModal.emit();
  }
}