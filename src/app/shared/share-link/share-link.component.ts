import { Component, OnInit, Input } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { AuthService } from '../../_services'

@Component({
  selector: 'edji-share-link',
  templateUrl: './share-link.component.pug',
  styleUrls: ['./share-link.component.scss'],
})
export class ShareLinkComponent implements OnInit {
  @Input() link: string

  public linkCopySuccess: boolean

  constructor(private _angulartics: Angulartics2, private _auth: AuthService) {}

  ngOnInit() {}

  /**
   * Copies the referral link to the user's clipboard
   */
  public copyShareLink() {
    this._angulartics.eventTrack.next({
      action: 'referral_copy_shareLink',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    // Create a new textarea element that we'll not make visible
    let selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    // Set the value of the textarea to be the share link with their referral code
    selBox.value = this.link
    document.body.appendChild(selBox)
    // Focus on the element text, select the text, and use a copy command
    selBox.focus()
    selBox.select()
    document.execCommand('copy')
    // Take this hidden element out of the DOM
    document.body.removeChild(selBox)
    // Show a success alert when the code is copied to their clipboard
    this.linkCopySuccess = true
    setTimeout(() => {
      this.linkCopySuccess = false
    }, 3000)
  }
}
