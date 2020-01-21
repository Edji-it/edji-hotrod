import { Pipe, PipeTransform } from '@angular/core'
// import { linkifyStr } from 'linkifyjs/string';

var linkifyString = require('linkifyjs/string')

@Pipe({ name: 'linkify' })
export class LinkifyPipe implements PipeTransform {
  transform(str: string, options?: { hashtags?: boolean }): string {
    let val = str ? linkifyString(str, { target: '_blank' }) : str
    if (options && options.hashtags) {
      val = val.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
        return '<a class="hashtag" href="./?tag=' + t.replace('#', '') + '">' + t + '</a>'
      })
    }
    return val
  }
}
