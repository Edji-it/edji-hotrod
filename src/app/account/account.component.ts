import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { User } from '../shared/datatypes';

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
  
  private currentUser   : any;
  private showPassModal : boolean = false;
  private showUploadProfPicModal : boolean = false;

  constructor(private _auth: AuthService  /*, private _title: Title*/) {
    this.currentUser = this._auth.getUser();
  } // constructor

  ngOnInit() { 
    // this._title.setTitle('Edji | "' + this.currentUser['fullname'] + '"');
  } // ngOnInit  
} // class