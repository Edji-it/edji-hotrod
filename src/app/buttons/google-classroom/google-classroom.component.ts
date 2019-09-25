import { Component, AfterViewInit, Input, ViewEncapsulation } from '@angular/core'
import { Angulartics2 } from 'angulartics2';

// Internal
import { AuthService } from 'src/app/_services';

declare const gapi: any
var googleClassroomShareButton: any

@Component({
  selector: 'edji-google-classroom-share',
  templateUrl: './google-classroom.component.pug',
  styleUrls: ['./google-classroom.component.scss'],
  encapsulation: ViewEncapsulation.None // Since Gapi updates the dom, we have to avoid encapsulation
})
export class GoogleClassroomShareButton implements AfterViewInit {
  @Input()
  size = 32
  @Input()
  url: string
  @Input()
  title = ''
  @Input()
  instructions = ''

  public labelText: string = 'Classroom'

  constructor(private _angulartics: Angulartics2, private _auth: AuthService) {
    googleClassroomShareButton = this
  }

  ngAfterViewInit() {
    this.renderClassroomButton()
  }

  private renderClassroomButton() {
    gapi.sharetoclassroom.render('g-sharetoclassroom', {
      size: this.size,
      url: this.url,
      title: this.title,
      body: this.instructions,
      onsharestart: this.googleClassroomStartCallback,
      onsharecomplete: this.googleClassroomShareCallback
    })
  }

  /**
   * Report to GA
   * @param type event type
   */
  private reportAttempt(type: string) {
    this._angulartics.eventTrack.next({
      action: 'groupCodeModal_googleClassroom_' + type,
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }

  private googleClassroomStartCallback = () => {
    googleClassroomShareButton.reportAttempt('shareStart')
  }

  private googleClassroomShareCallback = () => {
    // Report success
    googleClassroomShareButton.reportAttempt('shareComplete')
    googleClassroomShareButton.labelText = ':white_check_mark: Shared'
  }
} 