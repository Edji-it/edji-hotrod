import { NgModule, Pipe, PipeTransform } from '@angular/core';
import * as emojione from 'emojione/lib/js/emojione.js';

@Pipe({
  name: 'emojione'
})
export class EmojiOnePipe implements PipeTransform {
  transform(text: string): string {
    let url = 'assets/emoji/png/';
    let html : string;

    let convertShortcodes = function(substring) {
      let emojiUc : string;
      // emojione.emojioneList is an object used to map SHORTCODES to UNICODE
      if (emojione.emojioneList[substring]) {
        emojiUc = emojione.emojioneList[substring].uc;
      } else {
        emojiUc = emojione.emojioneList[':question:'].uc;
      }
      return '<img class="emojioneemoji" src="' + url + emojiUc + '.png">';  
    };

    // Pipes could get passed anything from the template, lets not make assumptions
    if (typeof(text) == 'string') {
      html = text.replace(/:[a-zA-Z0-9\-\_]*:/g, convertShortcodes);
    } else {
      html = '';
    }
    return html;
  }
}