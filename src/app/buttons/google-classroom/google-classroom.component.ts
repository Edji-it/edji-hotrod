import { Component, AfterViewInit, Input, ViewEncapsulation } from '@angular/core'

declare const gapi: any

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

  constructor() { }

  ngAfterViewInit() {
    this.renderClassroomButton()
  }

  private renderClassroomButton() {
    gapi.sharetoclassroom.render('g-sharetoclassroom', {
      size: this.size,
      url: this.url,
      title: this.title,
      body: this.instructions,
      onsharecomplete: this.googleClassroomShareCallback
    })
  }

  private googleClassroomShareCallback = (values) => {
    console.log("Share complete", values)
  }
} 