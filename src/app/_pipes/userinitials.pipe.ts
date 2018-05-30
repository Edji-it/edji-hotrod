import { Pipe, PipeTransform } from '@angular/core';


@Pipe({name: 'userinitials'})
export class UserInitialsPipe implements PipeTransform {
  /*
  July 4th, 2017 - ~~~~~ INDEPENDENCE DAY ~~~~
  Nick Pumper
  Last Mod: July 4th, 2017 - Nick Pumper

  Use this to get the initials of a user's full name
  */

  transform(str: string): string {
    let result          = "";
    let firstInitialPos = 0;

    // 6.22.17 - Nick Pumper
    // Let's create the name initials.
    for (var i = 0; i < str.length; i++)
    {
      if  (result.length != 0 && result.length < 2 && str[i] == " ")
      {
        result = result + str[i + 1];
      } // if

      if (result.length == 0 && str[i] != " ")
      {
        result = str[i] + "";
        firstInitialPos = i;
      } // if

      // If at the end, the name initials are less then two characters, then pull the next available character.
      if (result.length < 2 && i === (str.length - 1))
      {
        // Find the next available character.
        for (var n = firstInitialPos + 1; n < str.length; n++)
        {
          if  (result.length < 2 && str[i] != " ")
          {
            result = result + str[n];
          } // if
        } // for n

        // If nameInitials is STILL not equal to two characters, add "!"
        if (result.length < 2)
        {
          result = result + "!";
        }
      } // if
    } // for i

    return result;
  }
} // class UserInfoPipe