import { Component, AfterViewInit, Input, ViewEncapsulation } from '@angular/core'
import { Angulartics2 } from 'angulartics2';
import { AuthService } from 'src/app/_services';

const LINK_COPY = 'Short Link'

@Component({
  selector: 'edji-copy-link-share',
  templateUrl: './copy-link.component.pug',
  styleUrls: ['./copy-link.component.scss']
})
export class CopyLinkShareButton implements AfterViewInit {
  @Input()
  url: string

  public labelText: string = LINK_COPY

  constructor(private _angulartics: Angulartics2, private _auth: AuthService) { }

  ngAfterViewInit() {

  }

  /**
   * Copies the referral link to the user's clipboard
   */
  public copyLink() {
    this._angulartics.eventTrack.next({
      action: 'groupCodeModal_share_copyLink',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    // Create a new textarea element that we'll not make visible
    let selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    // Set the value of the textarea to be the share link with their referral code
    selBox.value = this.url
    document.body.appendChild(selBox)
    // Focus on the element text, select the text, and use a copy command
    selBox.focus()
    selBox.select()
    document.execCommand('copy')
    // Take this hidden element out of the DOM
    document.body.removeChild(selBox)
    // Show a success alert when the code is copied to their clipboard
    this.labelText = ':white_check_mark: Copied'
    setTimeout(() => {
      this.labelText = LINK_COPY
    }, 3000)
  }
} 