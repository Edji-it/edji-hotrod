import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Locker } from 'angular2-locker';

// Project Dependencies
import { MediaService } from '../../shared/media.service';

@Component({
  selector: 'upload-pdf-modal',
  templateUrl: './upload-pdf-modal.component.html',
  styleUrls: ['./upload-pdf-modal.component.scss'],
  providers: [
    MediaService
  ]
})
export class UploadPdfModalComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Output() returnImage: EventEmitter<any> = new EventEmitter();
  
  private uploadedDocs: any[] = [];
  // private newImgUrls: string[] = [];
  private selectedIndex: number = 0;
  private locker: any;
  private file: any = {};
  private selectedFiles: any[] = [];
  private uploading: boolean = false;
  private uploadUrl: string = '//grapple-dev.edji.it';
  private noUploadAllowed: boolean = true;
  private errorMsg: string = '';

  constructor(private _locker: Locker, private _media: MediaService) {
    this.locker = _locker.useDriver(Locker.DRIVERS.LOCAL);
  }

  ngOnInit() {
    // Load previously uploaded images
    if (this.locker.get('uploadedDocs')) {
      this.uploadedDocs = this.locker.get('uploadedDocs');
    }
  }

  /**
   * Set 'file' variable and validate file
   */
  updateUploadFile() {
    const files = document.getElementById('pdfFileInput')['files'];
    this.file = files[0];
    // Limit file size to 5mb
    if (this.file && this.file.size > 5 * Math.pow(10, 6) ) {
      this.noUploadAllowed = true;
      this.errorMsg = 'Pdf uploads are limited to 5mb, please select a smaller pdf';
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

    if(this.file == null){
      alert('No file selected.');
      return;
    }

    this.uploading = true;

    this._media.uploadPdf(this.file)
      .subscribe(data => {
        this.uploading = false;
        this.addUpload(data);
      }, error => {
        this.uploading = false;
      });
  }

  

  /**
   * Add upload URL to array and localStorage
   */
  addUpload(data: any) : void {
    // this.newImgUrls.unshift(url);
    this.uploadedDocs.unshift(data);
    this.locker.set('uploadedDocs', this.uploadedDocs);
  }

  insertImage(url: string) : void {
    this.returnImage.emit({ 'url': url });
    this.closeModal.emit();
  }
}