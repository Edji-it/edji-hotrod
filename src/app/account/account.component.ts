import { ActivatedRoute } from '@angular/router';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { User } from '../shared/datatypes';

@Component({
  selector: 'edji-account',
  styleUrls: ['./account.component.scss'],
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit, OnDestroy {

  /*
  Last Mod: July 4th, 2017 - INDEPENDENCE DAY - Nick Pumper

  The page for the user's account info. A profile page.
  */
  
  private nameInitials  : string = ""; // we gonna use these for the temp profile pic
  private currentUser   : any;
  private showPassModal : boolean = false;
  private showUploadProfPicModal : boolean = false;

  private subscriptions : any[] = []

  // Feature flags
  private heroAvailable: boolean = false

  constructor(private _auth: AuthService, private route: ActivatedRoute) {
    this.currentUser = this._auth.getUser();
    this.nameInitials = "";
  } // constructor

  ngOnInit() { 
    // this._title.setTitle('Edji | "' + this.currentUser['fullname'] + '"');

    this.subscriptions.push(
      this.route.params
      .subscribe((params: any) => { 
        if(params && params['secretSwitch']){
            this._auth.secretSwitches[params['secretSwitch']] = true;
            if (this._auth.secretSwitches['heroAvailable']) {
                this.heroAvailable = true
            }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
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
    //console.log("[account.component.ts] Called getAvatar()!");

    this.currentUser = this._auth.getUser();
    avatar = this.currentUser.avatar;

    return avatar;
  } // public getAvatar () : any 
} // class