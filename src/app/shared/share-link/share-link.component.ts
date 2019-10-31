import { Component, OnInit, Input } from '@angular/core'

// Internal
import { AuthService, AnalyticsService } from '../../_services'
import { copyToClipboard } from '../clipboard'

@Component({
  selector: 'edji-share-link',
  templateUrl: './share-link.component.pug',
  styleUrls: ['./share-link.component.scss'],
})
export class ShareLinkComponent implements OnInit {
  @Input() link: string

  public linkCopySuccess: boolean

  constructor(private _analytics: AnalyticsService) {}

  ngOnInit() {}

  /**
   * Copies the referral link to the user's clipboard
   */
  public copyShareLink() {
    this._analytics.event('referral_copy_shareLink')
    copyToClipboard(this.link)
    // Show a success alert when the code is copied to their clipboard
    this.linkCopySuccess = true
    setTimeout(() => {
      this.linkCopySuccess = false
    }, 3000)
  }
}
