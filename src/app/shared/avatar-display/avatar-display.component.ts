import { userInfo } from 'os';
import { Component, OnInit, Input, EventEmitter} from '@angular/core';
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
  Last Mod: 17 Aug 2017

  This shows the user's avatar in a bubble.

  ~ Temporary Pics ~ 7.28.17
  Unless tempDisplayMode is set to true, it will always display the user's avatar.
  Using tempDisplayMode, you can put any picture in the display without changing the user's avatar.
  In HTML it will look like:
    <avatar-display class="some-class" [tempDisplayMode]="true" [tempDisplayPic]="someImage"></avatar-display>
  */

  // Inputs
  @Input() avatarSize       : string    = 'lg';
  @Input() tempDisplayMode  : boolean   = false; // If we don't want this to reflect the user's actual, toggle this.
  @Input() tempDisplayPic   : string; // If tempDisplayMode is on, this display will show this instead.
  @Input() user             : any

  // Stored data
  private displayedAvatar : string;
  private nameInitials    : string = ""; // we gonna use these for the non-Hero profile pic
  private currentUser     : any; // We need data from this.

  constructor(private _auth: AuthService) {
    if (!this.user) {
      this.currentUser = this._auth.getUser();
    } else {
      this.currentUser = this.user
    }
    this.nameInitials = "";
  } // constructor

  ngOnInit () {
    
  }

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
  public getAvatar () : string
  {
    // If there isn't one, get one, unless this display is under tempDisplay mode
    if (this.tempDisplayMode === false)
    {
      this.updateDisplayedAvatar();
    }
    else {
      this.displayedAvatar = this.tempDisplayPic;
    }

    return this.displayedAvatar;
  } // public getAvatar () : any 

  // update this.displayedAvatar
  // Get the avatar from the user object
  public updateDisplayedAvatar ()
  {
    //console.log("[account.component.ts] Called getAvatar()!");
    this.currentUser = this._auth.getUser();
    this.displayedAvatar = this.currentUser.avatar;
  } // public updateDisplayedAvatar
} // class
