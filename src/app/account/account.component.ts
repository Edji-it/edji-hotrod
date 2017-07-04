import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'edji-account',
  styleUrls: ['./account.component.scss'],
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {

  /*
  Last Mod: 22 June 2017 - Nick Pumper

  The page for the user's account info. A profile page.
  */
  
  private nameInitials  : string = ""; // we gonna use these for the temp profile pic
  private currentUser   : any;
  private showPassModal : boolean = false;
  private showUploadProfPicModal : boolean = false;
  private hasAvatar : boolean = false;

  constructor(private _auth: AuthService /*, private _title: Title*/) {
    this.currentUser = this._auth.getUser();
    this.getAvatar(); // use this to set hasAvatar initially
    this.nameInitials = this.getUserInitials();
  } // constructor

  ngOnInit() { 
    // this._title.setTitle('Edji | "' + this.currentUser['fullname'] + '"');
  }

  public getUserInitials() : string 
  {
    var firstInitialPos;
    var result;

    result = "";
    firstInitialPos = 0; // needed for creating name initials

    this.currentUser = this._auth.getUser();

    // 6.22.17 - Nick Pumper
    // STEP: Let's create the name initials.
    for (var i = 0; i < this.currentUser.fullname.length; i++)
    {
      if  (result.length != 0 && result.length < 2 && this.currentUser.fullname[i] == " ")
      {
        result = result + this.currentUser.fullname[i + 1];
      } // if

      if (result.length == 0 && this.currentUser.fullname[i] != " ")
      {
        result = this.currentUser.fullname[i] + "";
        firstInitialPos = i;
      } // if

      // If at the end, the name initials are less then two characters, then pull the next available character.
      if (result.length < 2 && i === (this.currentUser.fullname.length - 1))
      {
        // Find the next available character.
        for (var n = firstInitialPos + 1; n < this.currentUser.fullname.length; n++)
        {
          if  (result.length < 2 && this.currentUser.fullname[i] != " ")
          {
            result = result + this.currentUser.fullname[n];
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
  } // public getUserInitials : ()

  // Accessor for user.avatar
  // Get the avatar from the user object
  public getAvatar () : string
  {
    let avatar;

    this.hasAvatar = false;
    this.currentUser = this._auth.getUser();

    console.log("[account.component.ts] Called getAvatar()!");
    // console.log("[account.component.ts]" + this.profileImage);
    if (this.currentUser.avatar)
    {
      avatar = this.currentUser.avatar;
      this.hasAvatar = true;
    }
    return avatar;
  } // public getAvatar () : any 
  
} // class