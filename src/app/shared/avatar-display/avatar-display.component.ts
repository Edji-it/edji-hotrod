import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';


@Component({
  selector: 'avatar-display',
  styleUrls: [ './avatar-display.component.scss' ],
  templateUrl: './avatar-display.component.html'
})
export class AvatarDisplayComponent implements OnInit {
   
  /*
  27 July 2017
  Nicholas Pumper
  Last Mod: 27 July 2017

  This shows the user's avatar in a bubble.
  */

  private nameInitials  : string = ""; // we gonna use these for the non-Hero profile pic
  private currentUser   : any; // We need data from this.

  constructor(private _auth: AuthService) {
    this.currentUser = this._auth.getUser();
    this.nameInitials = "";
  } // constructor

  ngOnInit () {}

  public getUserInitials() : string 
  {
    var firstInitialPos;
    var result;

    result = "";
    firstInitialPos = 0; // needed for creating name initials

    this.currentUser = this._auth.getUser();

    return result;
  } // public getUserInitials : ()

  // Accessor for user.avatar
  // Get the avatar from the user object
  public getAvatar () : string
  {
    let avatar;
    //console.log("[account.component.ts] Called getAvatar()!");

    this.currentUser = this._auth.getUser();
    avatar = this.currentUser.avatar;

    return avatar;
  } // public getAvatar () : any 
} // class
