import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'edji-account',
  styleUrls: ['./account.component.scss'],
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {

  /*
  Last Mod: July 4th, 2017 - INDEPENDENCE DAY - Nick Pumper

  The page for the user's account info. A profile page.
  */
  
  private nameInitials  : string = ""; // we gonna use these for the temp profile pic
  private currentUser   : any;
  private showPassModal : boolean = false;
  private showUploadProfPicModal : boolean = false;

  constructor(private _auth: AuthService /*, private _title: Title*/) {
    this.currentUser = this._auth.getUser();
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

    return result;
  } // public getUserInitials : ()

  // Accessor for user.avatar
  // Get the avatar from the user object
  public getAvatar () : string
  {
    let avatar;

    console.log("[account.component.ts] Called getAvatar()!");

    this.currentUser = this._auth.getUser();
    avatar = this.currentUser.avatar;

    return avatar;
  } // public getAvatar () : any 
  
} // class