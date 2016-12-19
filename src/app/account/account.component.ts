import { Component, OnInit } from '@angular/core';

import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'edji-account',
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {
  private currentUser: any;
  
  constructor(private _auth: AuthService) {
    this.currentUser = this._auth.getUser();
  }

  ngOnInit() {

  }
}