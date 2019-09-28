import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { take } from 'rxjs/operators'

// Project Dependencies
import { AuthService, LockerService, MediaService } from '../../_services'

@Component({
  selector: 'upload-picture-modal',
  templateUrl: './upload-picture-modal.component.pug',
  styleUrls: ['./upload-picture-modal.component.scss'],
})
export class UploadModalComponent implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter()
  @Output() returnImage: EventEmitter<any> = new EventEmitter()

  public uploadedImages: any[] = []
  public newImgUrls: string[] = []
  public selectedIndex: number = 0
  public file: any = {}
  public uploading: boolean = false
  public uploadUrl: string = '//grapple-dev.edji.it'

  public noUploadAllowed: boolean = true
  public errorMsg: string = ''

  constructor(private _locker: LockerService, private _media: MediaService, private _auth: AuthService) {}

  ngOnInit() {
    // Load previously uploaded images
    if (this._auth.getUser().media && this._auth.getUser().media.images) {
      this.uploadedImages = this._auth.getUser().media.images
    }

    // Get the latest uploaded pics
    this._auth
      .refreshUser()
      .pipe(take(1))
      .subscribe(user => {
        this.uploadedImages = user.media.images
      })
  }

  /**
   * Set 'file' variable and validate file
   */
  updateUploadFile() {
    const files = document.getElementById('imageFileInput')['files']
    this.file = files[0]
    // Limit file size to 5mb
    if (this.file && this.file.size > 5 * Math.pow(10, 6)) {
      this.noUploadAllowed = true
      this.errorMsg = 'Image uploads are limited to 5mb, please select a smaller image'
    } else {
      this.noUploadAllowed = false
      this.errorMsg = ''
    }
  }

  /**
   * Upload image and add image to modal for selection
   */
  beginUpload() {
    this.updateUploadFile()

    if (this.file == null || this.noUploadAllowed) {
      alert('No file selected.')
      return
    }

    this.uploading = true

    this._media.uploadImage(this.file).subscribe(
      data => {
        this.uploading = false
        this.addUploadUrl(data.url)
        this.file = {}
      },
      error => {
        this.uploading = false
      },
    )
  }

  /**
   * Add upload URL to array and localStorage
   */
  addUploadUrl(url: string, title?: string): void {
    let imgObj = {
      url: url,
      title: title,
    }

    this.newImgUrls.unshift(url)
    this.uploadedImages.unshift(imgObj)
    this._locker.set('uploadedImages', this.uploadedImages)

    let user = this._auth.getUser()
    if (!user.media) {
      user.media = {}
    }
    if (!user.media.images) {
      user.media.images = []
    }
    user.media.images = this.uploadedImages
    this._auth
      .updateUser(user)
      .pipe(take(1))
      .subscribe(
        data => {
          if (data.user && data.user.media) {
            this.uploadedImages = user.media.images
          }
        },
        error => {
          console.log(error)
        },
      )
  }

  insertImage(imageIndex: number): void {
    this.returnImage.emit([this.uploadedImages[imageIndex]])
    this.closeModal.emit()
  }
}
