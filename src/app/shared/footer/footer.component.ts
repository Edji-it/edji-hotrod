import { Component, OnInit } from '@angular/core';

declare var window: any

@Component({
  selector: 'footer',
  styleUrls: [ './footer.component.scss' ],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {
  private appVersion;
  private emojiOneAttribution: string = 'Emoji supplied by <a style=\'padding-left:0px;padding-right:0px;color:#999;\' href=\'http://emojione.com/\'>EmojiOne :unicorn:</a>';
  private window
  private browserProperties: any

  constructor() {
    this.window = window
  }

  ngOnInit() {
    this.browserProperties = '%0A%0A' + 'So we may be able to help you quicker, please do not delete the information below! Thank you!' + '%0A%0A' + this.window.navigator.userAgent
  }
}
