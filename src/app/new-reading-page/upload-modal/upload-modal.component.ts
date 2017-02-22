import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Locker } from 'angular2-locker';

@Component({
  selector: 'upload-modal',
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.scss']
})
export class UploadModalComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Output() returnImage: EventEmitter<any> = new EventEmitter();
  
  private uploadedUrls: string[] = [];
  private selectedIndex: number = 0;
  private locker: any;
  private file: any = {};
  private uploading: boolean = false;

  constructor(private _locker: Locker) {
    this.locker = _locker.useDriver(Locker.DRIVERS.LOCAL);
  }

  ngOnInit() {
    if (this.locker.get('uploadedImageUrls')) {
      this.uploadedUrls = this.locker.get('uploadedImageUrls');
    }
  }

  updateUploadFile() {
    console.log("UPDATE UPLOAD");
    const files = document.getElementById('file-input')['files'];
    this.file = files[0];
  }

  beginUpload() {
    this.uploading = true;
    const files = document.getElementById('file-input')['files'];
    this.file = files[0];
    if(this.file == null){
      return alert('No file selected.');
    } else {
      console.log(this.file);
    }
    this.getSignedRequest(this.file);
  }

  getSignedRequest(file) {
     const xhr = new XMLHttpRequest();
    xhr.open('GET', `//grapple-dev.edji.it/sign-s3?file-name=${file.name}&file-type=${file.type}`);
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
    this.file = {};
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