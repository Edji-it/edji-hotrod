import { cli } from 'webdriver-manager/built/lib/cli_instance'
import { HtmlParser } from '@angular/compiler'
import { NgModule, Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'addclass'
})
export class AddClassPipe implements PipeTransform {
  transform(html: string, args?: string): string {
    // Determine where in the string class starts
    const strStart = html.indexOf('class')
    let c = ''

    if (typeof(args) == 'string') {
      c = args
    }

    // Determine where in the string class ends
    let count = 0
    let strEnd = 0
    for (let i = strStart; i < html.length; i++) {
      if (html.charAt(i) == '"') {
        count++
        if (count == 2) {
          strEnd = i
        }
      }
    }

    // Split the string, add the class, then put it back together
    const text1 = html.substring(0, strStart)
    const text2 = html.substring(strStart, strEnd)
    const text3 = html.substring(strEnd + 1, html.length)
    const text2m = text2.substring(0, text2.length) + ' ' + c + '"'
    const textFinal = text1 + ' ' + text2m + ' ' + text3

    // Put the string back together and send back
    return textFinal
  }
}
