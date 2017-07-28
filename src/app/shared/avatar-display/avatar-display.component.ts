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
  Last Mod: 28 July 2017

  This shows the user's avatar in a bubble.
  */

  // Inputs
  @Input() avatarSize : string = 'lg';
  @Input() tempDisplay : string; // If we want a temp display in this avatar, then fill this input.

  private displayedAvatar : string;
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
  public getAvatar () : string
  {

    // If we are given a temp input, ignore the actual pic.
    if (this.tempDisplay)
    {
      this.displayedAvatar = this.tempDisplay;
    }
    // If there isn't one, get one.
    else
    {
      this.updateDisplayedAvatar();
    } // if

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
