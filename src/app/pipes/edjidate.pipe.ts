import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'edjidate'
})

export class EdjiDatePipe implements PipeTransform {
  transform(isoTime:string, args?:string):string {
    if (args==='timeago') {
      // convert the passed in timestamp to a time ago format
      let time = new Date(isoTime);
      let now = new Date();
      let one_minute = 1000 * 60;
      let minDiff = Math.abs(Math.ceil((time.getTime() - now.getTime())/(one_minute)));
      let hourDiff;
      let dayDiff;
      let diffText = '';

      if (minDiff > 59) {
          hourDiff = Math.floor(minDiff/60);
          minDiff = minDiff%60;
      }

      if (hourDiff > 23) {
          dayDiff = Math.floor(hourDiff/60);
          hourDiff = hourDiff%60;
      }

      if ( typeof(dayDiff) !== 'undefined' ) {
          diffText += dayDiff + " days";
      } else if ( typeof(hourDiff) !== 'undefined' ) {
          diffText += hourDiff + " hours";
      } else if (minDiff < 1) {
          diffText += "less than 1 min";
      } else if (minDiff < 1) {
          diffText += minDiff + " min";
      } else {
          diffText += minDiff + " mins";
      }

      return "Last saved " + diffText + " ago";
    } else if (args==='timestamp') {
      // convert the passed in timestamp to a friendly timestamp format
      
    }
  }
}
