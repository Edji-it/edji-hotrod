import { Component, AfterViewInit, Input, ViewEncapsulation } from '@angular/core'

// Internal
import { AnalyticsService } from 'src/app/_services'
import { copyToClipboard } from 'src/app/shared/clipboard'

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
    this.embedCode = `<iframe src="${location.origin}/#/embed/${this.id}" style="border:1px #ef832e solid; border-radius: 8px !important; width: 100% !important; height: 100% !important; min-height: 800px; min-width: 600px;" name="Edji Reading" scrolling="auto"  width="600px" height="800px" align="bottom"></iframe>`
  }
  get projectId(): string {
    return this.id
  }

  private id: string = ''
  public labelText: string = LINK_COPY
  public embedCode: string = ''

  constructor(private _analytics: AnalyticsService) {}

  ngAfterViewInit() {}

  /**
   * Copies the embed code to the user's clipboard
   */
  public copyCode() {
    this._analytics.event('groupCodeModal_share_copyEmbed')
    copyToClipboard(this.embedCode)
    // Show a success alert when the code is copied to their clipboard
    this.labelText = ':white_check_mark: Copied'
    setTimeout(() => {
      this.labelText = LINK_COPY
    }, 3000)
  }
}
