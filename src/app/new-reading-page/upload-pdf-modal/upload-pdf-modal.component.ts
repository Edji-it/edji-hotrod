import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Locker } from 'angular2-locker';

@Component({
  selector: 'upload-pdf-modal',
  templateUrl: './upload-pdf-modal.component.html',
  styleUrls: ['./upload-pdf-modal.component.scss']
})
export class UploadPdfModalComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Output() returnImage: EventEmitter<any> = new EventEmitter();
  
  private uploadedUrls: string[] = [];
  private newImgUrls: string[] = [];
  private selectedIndex: number = 0;
  private locker: any;
  private file: any = {};
  private uploading: boolean = false;
  private uploadUrl: string = '//grapple-dev.edji.it';

  constructor(private _locker: Locker) {
    this.locker = _locker.useDriver(Locker.DRIVERS.LOCAL);
  }

  ngOnInit() {
    if (this.locker.get('uploadedImageUrls')) {
      this.uploadedUrls = this.locker.get('uploadedImageUrls');
    }

    // Check to see if prod or dev environment
      if (window.location.host.indexOf('dev.edji.it') > -1) {
        this.uploadUrl = '//grapple-dev.edji.it';
      } else if (window.location.host.indexOf('edji.it') > -1 || window.location.host.indexOf('dvscf5tf91syg.cloudfront.net') > -1) {
        this.uploadUrl = '//grapple.edji.it';
      }
  }

  updateUploadFile() {
    console.log("UPDATE UPLOAD");
    const files = document.getElementById('imageFileInput')['files'];
    this.file = files[0];
  }

  beginUpload() {
    const files = document.getElementById('imageFileInput')['files'];
    this.file = files[0];
    if(this.file == null){
      alert('No file selected.');
      return;
    }

    this.uploading = true;
    this.getSignedRequest(this.file);
  }

  getSignedRequest(file) {
     const xhr = new XMLHttpRequest();
    xhr.open('GET', this.uploadUrl + '/sign-s3?file-name=' + file.name + '&file-type=' + file.type);
    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          const response = JSON.parse(xhr.responseText);
          this.uploadFile(this.file, response.signedRequest, response.url);
        } else{
          alert('Could not get signed URL.');
          this.uploading = false;
        }
      }
    };
    xhr.send();
  }

  uploadFile(file, signedRequest, url){
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedRequest);
    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          this.addUploadUrl(url);
          this.uploading = false;
        }
        else{
          alert('Could not upload file.');
          this.uploading = false;
        }
      }
    };
    xhr.send(this.file);
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