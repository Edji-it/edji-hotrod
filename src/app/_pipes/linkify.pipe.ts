import { Pipe, PipeTransform } from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// import { linkifyStr } from 'linkifyjs/string';

var linkifyString = require('linkifyjs/string')

@Pipe({ name: 'linkify' })
export class LinkifyPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  
  transform(str: string, options?: { hashtags?: boolean, quickLabels?: boolean }): string {
    let val = str ? linkifyString(str, { target: '_blank' }) : str
    // Wrap hashtags
    if (options && options.hashtags) {
      val = val.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
        return '<a class="comment-hashtag">' + t + '</a>'
      })
    }
    if (options && options.quickLabels) {
      val = this.transformQuickLabels(val)
    }
    return val
  }

  transformQuickLabels(str = '', sanitize?: boolean): string | SafeHtml {
    let html =  str.replace(/(#\[)+.[^\[\]]+(\])/g, function(t) {
      return `<a class="quick-label" contenteditable="false">
                <i class="icon icon-quick-label"></i>
                <span>${t.replace(/(#\[)|(\])/g,'')}</span>
              </a>`
    })
    if (sanitize) {
      // Setting attributes requires sanitizing html
      return this.sanitized.bypassSecurityTrustHtml(html)
    } else {
      return html
    }
  }
}
