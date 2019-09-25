import { Component, AfterViewInit, Input } from '@angular/core'

declare var gapi: any
declare var googleClassroomShareCallback: any

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
  shareCallback: any

  constructor() {
    this.shareCallback = googleClassroomShareCallback = (data) => {
      console.log('data', data)
      console.log('classroom share complete!')
    }
  }



  ngAfterViewInit() {
    gapi.sharetoclassroom.render('g-sharetoclassroom', { size: this.size, url: this.url })
  }
} 