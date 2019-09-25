import { Component, AfterViewInit, Input, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'edji-copy-link-share',
  templateUrl: './copy-link.component.pug',
  styleUrls: ['./copy-link.component.scss']
})
export class CopyLinkShareButton implements AfterViewInit {
  @Input()
  url: string

  constructor() { }

  ngAfterViewInit() {

  }

  private googleClassroomShareCallback = (values) => {
    console.log("Share complete", values)
  }
} 