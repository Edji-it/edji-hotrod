import { NgModule, Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'edjidate'
})

// Available displayType: timeAgo, timeStamp
// Available timeFormat for timeStamp: longDate, mediumDate, shortDate

export class EdjiDatePipe implements PipeTransform {
  transform(isoTime: string, displayType?: string, timeFormat?: string, triggerChange?: number): string {
    const time = new Date(isoTime)
    if (displayType === 'timeAgo') {
      // Convert the passed in timestamp to a time ago format
      const now = new Date()
      const one_minute = 1000 * 60
      const one_second = 1000
      let secDiff = Math.abs(Math.ceil((time.getTime() - now.getTime()) / (one_second)))
      let minDiff = Math.abs(Math.ceil((time.getTime() - now.getTime()) / (one_minute)))
      let hourDiff
      let dayDiff
      let diffText = ''

      if (secDiff > 59) {
          minDiff = Math.floor(secDiff / 60)
          secDiff = secDiff % 60
      }

      if (minDiff > 59) {
          hourDiff = Math.floor(minDiff / 60)
          minDiff = minDiff % 60
      }

      if (hourDiff > 23) {
          dayDiff = Math.floor(hourDiff / 24)
          hourDiff = hourDiff % 60
      }

      if ( typeof(dayDiff) !== 'undefined' ) {
          if (dayDiff === 1) {
            diffText += dayDiff + ' day'
          } else {
            diffText += dayDiff + ' days'
          }
      } else if ( typeof(hourDiff) !== 'undefined' ) {
          if (hourDiff === 1) {
            diffText += hourDiff + ' hour'
          } else {
            diffText += hourDiff + ' hours'
          }
      } else if (minDiff < 1) {
          diffText += 'less than 1 min'
      } else if (minDiff == 1) {
          diffText += minDiff + ' min'
      } else {
          diffText += minDiff + ' mins'
      }

      return diffText + ' ago'
    } else if (displayType === 'timeStamp') {
      // Convert the passed in timestamp to a friendly timestamp format
      let newTime
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    	const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

      if ( typeof(timeFormat) !== 'undefined' ) {
        switch (timeFormat) {
            case 'longDate':
                // Converts the date to the following format: Friday April 21, 2017
								newTime = days[time.getDay()] + ' ' + months[time.getMonth()] + ' ' + time.getDate() + ', ' + time.getFullYear()
                break
            case 'mediumDate':
                // Converts the date to the following format: Fri Apr 21, 2017
								newTime = shortDays[time.getDay()] + ' ' + shortMonths[time.getMonth()] + ' ' + time.getDate() + ', ' + time.getFullYear()
                break
            case 'shortDate':
                // Converts the date to the following format: m/d/yyyy
								newTime = time.getMonth() + '/' + time.getDate() + '/' + time.getFullYear()
                break
        }
      } else {
        // If no format is specified, convert the date to the following format: m/d/yyyy
				newTime = time.getMonth() + '/' + time.getDate() + '/' + time.getFullYear()
      }

      return newTime
    } else {
			// Default case if the type of time format update is not selected, convert the date to the following format: m/d/yyyy
			return time.getMonth() + '/' + time.getDate() + '/' + time.getFullYear()
		}
  }
}
