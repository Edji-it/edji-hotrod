import { Pipe, PipeTransform } from '@angular/core'
// import { linkifyStr } from 'linkifyjs/string';

var linkifyString = require('linkifyjs/string')

@Pipe({ name: 'linkify' })
export class LinkifyPipe implements PipeTransform {
  transform(str: string): string {
    return str ? linkifyString(str, { target: '_blank' }) : str
  }
}
