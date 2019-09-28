import { Component, OnInit, Input } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { AuthService } from '../../_services'

@Component({
  selector: 'edji-share-social-icons',
  templateUrl: './share-social-icons.component.pug',
  styleUrls: ['./share-social-icons.component.scss'],
})
export class ShareSocialIconsComponent implements OnInit {
  private _link: string
  // Copy inputs
  @Input() subjectCopy: string
  @Input() messageCopy: string
  // Handle formatting social links whenever link changes
  @Input('link') set shareLink(link) {
    this._link = link
    this.socialLinks = this.formatLinks(link)
  }
  get shareLink(): string {
    return this._link
  }

  public socialLinks: SocialLinks = {
    email: '',
    twitter: '',
    facebook: '',
  }
  constructor(private _angulartics: Angulartics2, private _auth: AuthService) {}

  ngOnInit() {}

  private formatLinks(shareLink: string): SocialLinks {
    let socialLinks = {
      emailSubject: this.subjectCopy,
      emailBody: encodeURIComponent(this.messageCopy + '\n'),
      twitter: encodeURIComponent(this.messageCopy + ' '),
      facebook: `https://www.facebook.com/sharer/sharer.php?u=`,
    }
    let email = `mailto:?subject=${socialLinks.emailSubject}&body=${socialLinks.emailBody}`
    let twitter = `https://twitter.com/intent/tweet?text=${socialLinks.twitter}`

    return {
      email: `${email}${encodeURIComponent(shareLink)}`,
      twitter: `${twitter}${encodeURIComponent(shareLink)}`,
      facebook: `${socialLinks.facebook}${encodeURIComponent(shareLink)}&amp;src=sdkpreparse`,
    }
  }

  /**
   * Depending on which share button is clicked, perform a certain action
   * @param shareMedium is the path the user will be using to share their referral code
   */
  public trackReferralLink(shareMedium: string) {
    // fire an analytic event here for tracking purposes
    this._angulartics.eventTrack.next({
      action: 'referral_' + shareMedium + '_shareLink',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }
}

interface SocialLinks {
  email: string
  twitter: string
  facebook: string
}
