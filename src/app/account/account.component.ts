import { Component, OnInit } from '@angular/core';

import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'edji-account',
  styleUrls: ['./account.component.scss'],
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {

  /*
  Last Mod: 20 June 2017

  The page for the user's account info. A profile page.
  */

  public profileImage : any = "/assets/test-profile-pic/tdr.jpg";

  private currentUser: any;
  private showPassModal: boolean = false;
  
  constructor(private _auth: AuthService) {
    this.currentUser = this._auth.getUser();
  }

  ngOnInit() {

  }
} // class