import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Locker } from 'angular2-locker';

// Project Dependencies
import { MediaService, AuthService } from '../../shared';

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
  private newDocsIds: string[] = []; 
  // private newImgUrls: string[] = [];
  private selectedIndex: number = 0;
  private locker: any;
  private file: any = {};
  private title: string = '';
  private selectedFiles: any[] = [];
  private uploading: boolean = false;
  private uploadUrl: string = '//grapple-dev.edji.it';
  private noUploadAllowed: boolean = true;
  private errorMsg: string = '';

  constructor(private _locker: Locker, private _media: MediaService, private _auth: AuthService) {
    this.locker = _locker.useDriver(Locker.DRIVERS.LOCAL);
  }

  ngOnInit() {
    // Load previously uploaded docs
    if (this.locker.get('uploadedDocs')) {
      this.uploadedDocs = this.locker.get('uploadedDocs');
    } else if (this._auth.getUser().media && this._auth.getUser().media.documents) {
      this.uploadedDocs = this._auth.getUser().media.documents;
    }
    // Check existing Uploaded Docs for any not yet marked as converted
    // So we can check on them!
    this.uploadedDocs.forEach(doc => {
      if (doc.converted === false) {
        this.checkConversion(doc.uuid)
      }
    })

    // Get the latest uploaded docs
    this._auth.refreshUser().take(1).subscribe(user => {
      if (user.media && user.media.documents) {
        this.uploadedDocs = user.media.documents
      }
    })
  }

  /**
   * Set 'file' variable and validate file
   */
  updateUploadFile() {
    const files = document.getElementById('pdfFileInput')['files'];
    this.file = files[0];
    if (this.file.name && this.title.length < 1) {
      this.title = this.file.name;
    }
    // Limit file size to 10mb
    if (this.file && this.file.size > 10 * Math.pow(10, 6) ) {
      this.noUploadAllowed = true;
      this.errorMsg = 'PDF uploads are limited to 10mb, please select a smaller PDF.';
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

    if(!this.title || this.title.length < 1) {
      this.errorMsg = 'Please give your document a title.';
      return;
    }

    this.uploading = true;

    this._media.uploadPdf(this.file)
      .subscribe(data => {
        this.uploading = false;
        // Set converted property
        data.converted = false;
        // Set document title to copy
        data.title =  (' ' + this.title).slice(1);
        // Add document to user's uploaded documents
        this.addUpload(data);
        // Clear fields
        this.file = {};
        this.title = '';
      }, error => {
        this.uploading = false;
        this.errorMsg = '<b>Upload failed!</b> Please try again later, or with a different file. If this problem persists, please <a href="mailto:brennen@edji.it">contact us</a>.';
      });
  }

  /** 
   * Run check until document is confirmed as processed
   */
  checkConversion(fileId): void {
    let ONE_HOUR = 60 * 60 * 1000;

    this._media.pdfCheck(fileId)
      .take(1)
      .subscribe(
        data => {
          if (data.converted === true) {
            // Mark document as converted
            this.newDocsIds.push(data.uuid);
            this.updateUploadedDoc(data);
          } else if (data.error) {
            // Pass doc with error
            this.updateUploadedDoc(data);
          } else if ( !data.requestedTime || (Date.now() - data.requestedTime) > ONE_HOUR) {
            // If this is old, expire the document
            data.expired = true;
            this.updateUploadedDoc(data);
          } else {
            // Check again later
            setTimeout(() => {
              this.checkConversion(fileId);
            }, 1500)
          }
        }, error => {
          // Handle this?
        });
  }

  /**
   * Update a single document, and propagate changes
   */
  updateUploadedDoc(updatedDoc: any) {
    this.uploadedDocs.forEach( (doc, index) => {
      if (updatedDoc.uuid === doc.uuid) {
        Object.assign(this.uploadedDocs[index], updatedDoc);
      }
    });
    this.saveUploadedDocs();
  }

  /**
   * Update a single document, and propagate changes
   */
  removeUploadedDoc(docToDelete: any) {
    this.uploadedDocs.forEach( (doc, index) => {
      if (docToDelete.uuid === doc.uuid) {
        // Remove doc 
        this.uploadedDocs.splice(index, 1);
      }
    });
    this.saveUploadedDocs();
  }

  /**
   * Add upload URL to array and localStorage
   */
  addUpload(data: any) : void {
    // Add document object
    this.uploadedDocs.unshift(data);
    // Save document object
    this.saveUploadedDocs();
    // Check if document is done converting
    this.checkConversion(data.uuid);
  }

  /**
   * Save Uploaded Doc list to localStorage AND user object
   */
  saveUploadedDocs(): void {
    this.locker.set('uploadedDocs', this.uploadedDocs);
    let user = this._auth.getUser();
    if (!user.media) {
        user.media = {};
    }
    if (!user.media.documents) {
        user.media.documents = [];
    }
    user.media.documents = this.uploadedDocs;
    this._auth.updateUser( user )
        .take(1)
        .subscribe(
          (user) => {
            if (user.documents) {
              this.uploadedDocs = user.media.documents
            }
          },
          (error) => {
            console.log(error)
          }
        );
  }

  insertPages(pages: any[]) : void {
    let images = [];
    pages.forEach(page => {
      images.push({ 'url': page } );
    });
    this.returnImage.emit(images);
    this.closeModal.emit();
  }

  insertImage(url: string) : void {
    this.returnImage.emit([{ 'url': url }]);
    this.closeModal.emit();
  }
}