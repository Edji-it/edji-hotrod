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
  title = 'this is my default title' /** @todo remove default here - it should just be an empty string */
  @Input()
  instructions = 'default instructions' /** @todo remove default here - it should just be an empty string */

  constructor() { }

  ngAfterViewInit() {
    gapi.sharetoclassroom.render('g-sharetoclassroom', {
      size: this.size,
      url: this.url,
      title: this.title,
      body: this.instructions,
      onsharecomplete: this.googleClassroomShareCallback
    })

    // setTimeout(() => {
    //   // apply styles
    //   var w = document.querySelector('#g-sharetoclassroom iframe')['contentDocument']
    //   // console.log(w)
    //   var s = document.createElement('style')
    //   s.innerHTML = this.iframeStyle
    //   s.type = 'text/css'
    //   w.head.appendChild(s)
    // }, 2000)
    console.log(gapi.sharetoclassroom)
  }

  private googleClassroomShareCallback = (values) => {
    console.log("Share complete", values)
  }
} 