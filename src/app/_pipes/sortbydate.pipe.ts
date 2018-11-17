import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByDate'
})
export class SortByDatePipe implements PipeTransform {

  /**
   * Sort By Date
   * @param array Values to sort
   * @param args Value to sort by (use "-" for descending")
   * @example <tr *ngFor="let item of mylst | sortgrid: '-createdDate'">
   */
  transform(array: Array<any>, args: string): Array<any> {
    if (typeof args[0] === "undefined") {
        return array;
    }
    let direction = args[0][0];
    let column = args.replace('-','');
    array.sort((a: any, b: any) => {
        let left = Number(new Date(a[column]));
        let right = Number(new Date(b[column]));
        return (direction === "-") ? right - left : left - right;
    });
    return array;
  }
}