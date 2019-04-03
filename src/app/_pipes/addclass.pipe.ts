import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'addclass',
})
export class AddClassPipe implements PipeTransform {
  transform(html: string, args?: string): string {
    // Determine where in the string class starts
    let strStart = html.indexOf('class')
    var c = ''

    if (typeof args == 'string') {
      c = args
    }

    // Determine where in the string class ends
    var count = 0
    var strEnd = 0
    for (var i = strStart; i < html.length; i++) {
      if (html.charAt(i) == '"') {
        count++
        if (count == 2) {
          strEnd = i
        }
      }
    }

    // Split the string, add the class, then put it back together
    let text1 = html.substring(0, strStart)
    let text2 = html.substring(strStart, strEnd)
    let text3 = html.substring(strEnd + 1, html.length)
    let text2m = text2.substring(0, text2.length) + ' ' + c + '"'
    let textFinal = text1 + ' ' + text2m + ' ' + text3

    // Put the string back together and send back
    return textFinal
  }
}
