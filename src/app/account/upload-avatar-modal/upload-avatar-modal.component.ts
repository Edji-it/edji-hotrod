import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { take } from 'rxjs/operators'

// Dependencies
import { AuthService, MediaService } from '../../_services'
import { User } from '../../shared/datatypes'

@Component({
  selector: 'hot-upload-avatar',
  styleUrls: ['./upload-avatar-modal.scss', '../account.component.scss'],
  templateUrl: 'upload-avatar-modal.component.html',
  providers: [MediaService],
})
export class UploadAvatarModal implements OnInit {
  /*
  23 June 2017
  by Nick Pumper
  Last Mod: July 4th, 2017 - INDEPENDENCE DAY - Nick Pumper
  
  A prompt asking if we really want to delete a project.
  If no, it closes. Otherwise. it deletes it.

  The user's avatar is stored in _auth.getUser().
  */

  // For closing this modal.
  @Output() closeModal: EventEmitter<any> = new EventEmitter()
  // Tell the account page to refresh the avatar plz.
  @Output() newAvatarConfirmed: EventEmitter<any> = new EventEmitter() // Tell the listening page to close the darned thing.

  public uploadedFile: string
  public showError: boolean = false
  public imageUploaded: boolean = false
  public currentUser: User

  constructor(private _media: MediaService, private _auth: AuthService) {
    this.currentUser = this._auth.getUser()
    this.uploadedFile = this.currentUser.avatar
  } // constructor

  ngOnInit() {}

  public updateUploadedFile(): void {
    // In our upload process, we're just gonna use the s3 bucket
    // in media.service

    const files = document.getElementById('imageFileInput')['files']
    // console.log("We are uploading.");

    let file = files[0]

    // Limit file size to 5mb
    if (file && file.size < 5 * Math.pow(10, 6)) {
      // Begin the image upload to the bucket
      this._media.uploadAvatar(file).subscribe(
        data => {
          // Begin Upload of the image's URL
          this.uploadedFile = data.url
          this.imageUploaded = true
        },
        error => {
          console.log('Upload failure (2)')
        },
      )
    } else {
      console.error('Upload failure. Either the image was null or too big.')
    }
  } // public updateUploadFile() voi

  public getSelectedImage(): any {
    return this.uploadedFile
  } // public getSelectedImage () : any

  public confirmNewAvatar(): void {
    this._auth
      .forceUpdateAvatar(this.uploadedFile)
      .pipe(take(1))
      .subscribe(
        () => {
          this.newAvatarConfirmed.emit()
          this.closeModal.emit()
        },
        error => {
          console.error(error)
        },
      )
  } //  public confirmNewAvatar () : void

  public removeAvatar(): void {
    this.uploadedFile = null
    this.imageUploaded = false
  } /// public removeAvatar () : void
} // class UploadProfPicModal
