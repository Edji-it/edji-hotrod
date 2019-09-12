/**
 * Home of the Constants
 * - To-Do: Share with Optimus Prime
 */

export const ALLSPARK = {
  EMAILREGEX: <RegExp>(
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
  ),
  BASELINEHEIGHT: <number>26,
  PHONEREGEX: <RegExp>/^([0-9]( |-)?)?(\(?[0-9]{3}\)?|[0-9]{3})( |-)?([0-9]{3}( |-)?[0-9]{4}|[a-zA-Z0-9]{7})$/,
  NAVBARHEIGHT: <number>70,
  GRADEINITIALS: <string[]>['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'U'],
  GRADENAMES: <string[]>[
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
    '5th Grade',
    '6th Grade',
    '7th Grade',
    '8th Grade',
    '9th Grade',
    '10th Grade',
    '11th Grade',
    '12th Grade',
    'University/College',
  ],
  SCHOOL_IDENTITIES: <string[]>['teacher', 'administrator', 'coach']
}
