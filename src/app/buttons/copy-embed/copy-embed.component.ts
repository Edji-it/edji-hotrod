import { Component, AfterViewInit, Input, ViewEncapsulation } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { AuthService } from 'src/app/_services'

const LINK_COPY = 'Embed Code'

@Component({
  selector: 'edji-copy-embed',
  templateUrl: './copy-embed.component.pug',
  styleUrls: ['./copy-embed.component.scss'],
})
export class CopyEmbedButton implements AfterViewInit {
  @Input()
  set projectId(id: string) {
    this.id = id
    this.embedCode = `<iframe src="${location.origin}/#/embed/${this.id}" style="border:1px #cdcdcd solid; width: 100%; height: 100%; min-height:600px; min-width:800px;" name="Edji Reading" scrolling="auto" align="bottom"></iframe>`
  }
  get projectId(): string {
    return this.id
  }

  private id: string = ''
  public labelText: string = LINK_COPY
  public embedCode: string = ''

  constructor(private _angulartics: Angulartics2, private _auth: AuthService) {}

  ngAfterViewInit() {}

  /**
   * Copies the referral link to the user's clipboard
   */
  public copyLink() {
    this._angulartics.eventTrack.next({
      action: 'groupCodeModal_share_copyEmbed',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    // Create a new textarea element that we'll not make visible
    let selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    // Set the value of the textarea to be the share link with their referral code
    selBox.value = this.embedCode
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
