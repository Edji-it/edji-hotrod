import { Component, AfterViewInit } from '@angular/core'

declare var gapi: any

@Component({
  selector: 'google-classroom-share',
  templateUrl: 'google-classroom.component.pug'
})
export class GoogleClassroomShareButton implements AfterViewInit {
  constructor() { }

  ngAfterViewInit() {
    gapi.sharetoclassroom.render('g-sharetoclassroom', { size: 32 })
  }
}