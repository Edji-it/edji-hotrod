import { NgModule, Pipe, PipeTransform } from '@angular/core';
import * as emojione from 'emojione/lib/js/emojione.js';

@Pipe({
  name: 'emojione'
})
export class EmojiOnePipe implements PipeTransform {
  transform(text: string): string {
    let url = 'assets/emoji/png/';
    if (emojione.emojioneList[text]) {
      url += emojione.emojioneList[text].uc + '.png';
    } else {
      url += emojione.emojioneList[':question:'].uc + '.png';
    }
    return '<img class="emojioneemoji" src="' + url + '">';
  }
}