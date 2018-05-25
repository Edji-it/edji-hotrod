import { NgModule, Pipe, PipeTransform } from '@angular/core'
import { emojioneList } from 'emojione/lib/js/emojione.js';

var stopGapList = {
  ":thinking_face:" : "1f914",
  ":person_with_blond_hair:" : "1f471",
  ":man_with_gua_pi_mao:" : "1f472",
  ":man_with_turban:" : "1f473",
  ":cop:" : "1f46e",
  ":guardsman:" : "1f482",
  ":spy:" : "1f575",
  ":walking:" : "1f6b6",
  ":runner:" : "1f3c3",
  ":dancers:" : "1f46f",
  ":bow:" : "1f647",
  ":information_desk_person:" : "1f481",
  ":no_good:" : "1f645",
  ":ok_woman:" : "1f646",
  ":raising_hand:" : "1f64b",
  ":person_with_pouting_face:" : "1f64e",
  ":haircut:" : "1f487",
  ":massage:" : "1f486",
  ":earth_asia:" : "1f30f",
  "last_quarter_moon_with_face:" : "1f31c",
  ":golfer:" : "1f3cc",
  ":rowboat:" : "1f6a3",
  ":swimmer:" : "1f3ca",
  ":surfer:" : "1f3c4",
  ":basketball_player:" : "26f9",
  ":lifter:" : "1f3cb",
  ":bicyclist:" : "1f6b4",
  ":mountain_bicyclist:" : "1f6b5",
  ":levitate:" : "1f574"
}

@Pipe({
  name: 'emojione'
})
export class EmojiOnePipe implements PipeTransform {
  transform(text: string): string {
    let url = '//emoji.edji.it/png/72x72/'
    
    let html : string;

    let convertShortcodes = function(substring) {
      let emojiUc : string;
      // emojione.emojioneList is an object used to map SHORTCODES to UNICODE
      if (emojioneList[substring]) {
        emojiUc = emojioneList[substring]['uc_base']
      } else if (stopGapList[substring]) {
        emojiUc = stopGapList[substring]
      } else {
        emojiUc = emojioneList[':question:']['uc_base']
      }
      
      // Provide unicode emoji as an alt fallback, and the shortcode as a title/tooltip
      return '<img class="emojioneemoji" alt="' + String.fromCharCode(parseInt(emojiUc,16)) + '" title="' + substring.replace(/:/g,'') + '" src="' + url + emojiUc + '.png">'  
    }

    // Pipes could get passed anything from the template, lets not make assumptions
    if (typeof(text) == 'string') {
      html = text.replace(/:[a-zA-Z0-9\-\_]*:/g, convertShortcodes)
    } else {
      html = ''
    }
    return html
  }
}