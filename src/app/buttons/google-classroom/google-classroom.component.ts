import { Component, AfterViewInit, Input } from '@angular/core'

declare const gapi: any

@Component({
  selector: 'edji-google-classroom-share',
  templateUrl: './google-classroom.component.pug'
})
export class GoogleClassroomShareButton implements AfterViewInit {
  @Input()
  size = 32
  @Input()
  url: string
  @Input()
  title = 'this is my default title' /** @todo remove default here - it should just be an empty string */
  @Input()
  instructions = 'default instructions' /** @todo remove default here - it should just be an empty string */
  googleClassroomShareCallback = () => { /** this callback can be used to record that the project was shared - it doesn't get passed anything */ }
  constructor() { }

  ngAfterViewInit() {
    gapi.sharetoclassroom.render('g-sharetoclassroom', { size: this.size, url: this.url, title: this.title, body: this.instructions, onsharecomplete: this.googleClassroomShareCallback })
  }
} 