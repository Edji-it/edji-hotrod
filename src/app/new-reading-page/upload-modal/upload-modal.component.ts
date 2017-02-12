import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'upload-modal',
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.scss']
})
export class UploadModalComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Output() returnImage: EventEmitter<any> = new EventEmitter();
  
  private uploadedUrl: string = '';

  constructor() { }

  ngOnInit() {
    
  }

  beginUpload() {
    const files = document.getElementById('file-input')['files'];
    const file = files[0];
    if(file == null){
      return alert('No file selected.');
    } else {
      console.log(file);
    }
    this.getSignedRequest(file);
  }

  getSignedRequest(file) {
     const xhr = new XMLHttpRequest();
    xhr.open('GET', `//grapple-dev.edji.it/sign-s3?file-name=${file.name}&file-type=${file.type}`);
    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          const response = JSON.parse(xhr.responseText);
          this.uploadFile(file, response.signedRequest, response.url);
        } else{
          alert('Could not get signed URL.');
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
          this.uploadedUrl = url;

          this.returnImage.emit(this.uploadedUrl);
          this.closeModal.emit();
        }
        else{
          alert('Could not upload file.');
        }
      }
    };
    xhr.send(file);
  }
}