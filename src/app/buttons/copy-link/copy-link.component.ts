import { Component, AfterViewInit, Input } from '@angular/core'
import { AuthService, AnalyticsService } from 'src/app/_services'

// Internal
import { copyToClipboard } from 'src/app/shared/clipboard'

const LINK_COPY = 'Short Link'

@Component({
  selector: 'edji-copy-link-share',
  templateUrl: './copy-link.component.pug',
  styleUrls: ['./copy-link.component.scss'],
})
export class CopyLinkShareButton implements AfterViewInit {
  @Input()
  url: string

  public labelText: string = LINK_COPY

  constructor(private _analytics: AnalyticsService, private _auth: AuthService) {}

  ngAfterViewInit() {}

  /**
   * Copies the referral link to the user's clipboard
   */
  public copyLink() {
    this._analytics.event('groupCodeModal_share_copyLink')
    copyToClipboard(this.url)
    // Show a success alert when the code is copied to their clipboard
    this.labelText = ':white_check_mark: Copied'
    setTimeout(() => {
      this.labelText = LINK_COPY
    }, 3000)
  }
}
