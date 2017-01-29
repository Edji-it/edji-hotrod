import { Component } from '@angular/core';

@Component({
  selector: 'footer',
  styleUrls: [ './footer.component.scss' ],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  private appVersion;
  private emojiOneAttribution: string = 'Emoji supplied by <a style=\'padding-left:0px;padding-right:0px;color:#999;\' href=\'http://emojione.com/\'>EmojiOne :unicorn:</a>';

  constructor() {
    
  }
}
